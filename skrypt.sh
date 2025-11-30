#!/bin/bash

files=(
  "src/components/CityCard.jsx"
  "src/components/CityDetails.jsx"
  "src/components/CityList.jsx"
  "src/components/FavoriteCitiesSlider.jsx"
  "src/components/FavoriteCityCard.jsx"
  "src/data/cities.js"
  "src/utils/temperature.js"
  "src/App.css"
  "src/App.jsx"
  "src/index.css"
  "src/main.jsx"
  "src/store.js"
  "index.html"
)

output="output.txt"
> "$output"

for file in "${files[@]}"; do
  if [[ -f "$file" ]]; then
    upper=$(echo "$file" | tr 'a-z' 'A-Z')
    echo "${upper}:" >> "$output"
    echo >> "$output"

    echo '```' >> "$output"
    cat "$file" >> "$output"
    echo >> "$output"
    echo '```' >> "$output"
    echo >> "$output"
  else
    echo "⚠️  Plik nie istnieje: $file"
  fi
done

echo "Gotowe! Wynik zapisany do $output"
