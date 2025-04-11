import org.springframework.boot.actuate.info.Info
import org.springframework.boot.actuate.info.InfoContributor
import org.springframework.cloud.client.serviceregistry.Registration
import org.springframework.cloud.consul.serviceregistry.ConsulRegistration
import org.springframework.cloud.consul.serviceregistry.ConsulRegistrationCustomizer
import org.springframework.stereotype.Component
import java.util.jar.Manifest

@Component
class AppVersion : InfoContributor, ConsulRegistrationCustomizer {

    private val version: String? by lazy {
        javaClass.`package`.implementationVersion
            ?: readVersionFromManifest()
    }

    override fun contribute(builder: Info.Builder) {
        builder.withDetail("version", version ?: "unknown")
    }

    override fun customize(registration: ConsulRegistration) {
        val metadata = registration.metadata
        version?.let {
            metadata["version"] = it
        }
    }

    private fun readVersionFromManifest(): String? {
        val resources = javaClass.classLoader.getResources("META-INF/MANIFEST.MF")
        for (url in resources) {
            url.openStream().use { stream ->
                val manifest = Manifest(stream)
                val value = manifest.mainAttributes.getValue("Implementation-Build")
                if (value != null) return value
            }
        }
        return null
    }
}