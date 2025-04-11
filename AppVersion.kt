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

import org.springframework.boot.actuate.info.Info
import org.springframework.boot.actuate.info.InfoContributor
import org.springframework.cloud.consul.serviceregistry.ConsulRegistration
import org.springframework.cloud.consul.serviceregistry.ConsulRegistrationCustomizer
import org.springframework.stereotype.Component
import java.io.File
import java.io.FileInputStream
import java.util.jar.JarInputStream
import java.util.jar.Manifest

@Component
class AppVersion : InfoContributor, ConsulRegistrationCustomizer {

    private val version: String? by lazy {
        readVersionFromOwnJar()
    }

    override fun contribute(builder: Info.Builder) {
        builder.withDetail("version", version ?: "unknown")
    }

    override fun customize(registration: ConsulRegistration) {
        version?.let {
            registration.metadata["version"] = it
        }
    }

    private fun readVersionFromOwnJar(): String? {
        val path = javaClass.protectionDomain.codeSource?.location?.toURI()?.path ?: return null
        val file = File(path)
        if (!file.exists() || !file.name.endsWith(".jar")) return null

        FileInputStream(file).use { fis ->
            JarInputStream(fis).use { jar ->
                val manifest: Manifest = jar.manifest ?: return null
                return manifest.mainAttributes.getValue("Implementation-Build")
                    ?: manifest.mainAttributes.getValue("Implementation-Version")
            }
        }
    }
}
private fun loadManifestAttribute(attribute: String): String? {
        val url = javaClass.classLoader.getResource("META-INF/MANIFEST.MF") ?: return null
        return url.openStream().use { stream ->
            val manifest = Manifest(stream)
            manifest.mainAttributes.getValue(attribute)
        }
    }
}
