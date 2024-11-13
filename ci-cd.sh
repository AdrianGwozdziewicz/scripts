#!/bin/bash

# Ustawienia
GITLAB_URL="https://gitlab.com"         # Adres GitLaba
PRIVATE_TOKEN="YOUR_PRIVATE_TOKEN"      # Twój prywatny token dostępu do API GitLaba
PROJECT_ID="123456"                     # ID projektu w GitLabie
SOURCE_BRANCH="feature-branch"          # Nazwa gałęzi źródłowej
TARGET_BRANCH="main"                    # Nazwa gałęzi docelowej
TITLE="Merge Request z Bash"            # Tytuł merge requesta
DESCRIPTION="Opis merge requesta z Bash" # Opis merge requesta

# Tworzenie merge requesta
response=$(curl --silent --header "PRIVATE-TOKEN: $PRIVATE_TOKEN" \
    --data "source_branch=$SOURCE_BRANCH" \
    --data "target_branch=$TARGET_BRANCH" \
    --data "title=$TITLE" \
    --data "description=$DESCRIPTION" \
    "$GITLAB_URL/api/v4/projects/$PROJECT_ID/merge_requests")

# Parsowanie ID merge requesta z odpowiedzi JSON bez użycia jq
MR_ID=$(echo "$response" | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
MR_URL=$(echo "$response" | grep -o '"web_url":"[^"]*' | sed 's/"web_url":"//')

# Sprawdzanie czy ID merge requesta zostało poprawnie wyciągnięte
if [ -n "$MR_ID" ]; then
    echo "Merge request utworzony pomyślnie: ID $MR_ID"
    echo "Link do merge requesta: $MR_URL"

    # Mergowanie utworzonego merge requesta
    merge_response=$(curl --silent --request PUT --header "PRIVATE-TOKEN: $PRIVATE_TOKEN" \
        "$GITLAB_URL/api/v4/projects/$PROJECT_ID/merge_requests/$MR_ID/merge")

    # Sprawdzanie czy merge request został zmergowany
    if echo "$merge_response" | grep -q '"state":"merged"'; then
        echo "Merge request został pomyślnie zmergowany."
    else
        echo "Błąd podczas mergowania merge requesta:"
        echo "$merge_response"
    fi
else
    echo "Błąd podczas tworzenia merge requesta:"
    echo "$response"
fi
