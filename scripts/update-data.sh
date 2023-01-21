#!/bin/bash

# Fetch the JSON data from a remote API and set its save location
json_data=$(curl -s https://raw.githubusercontent.com/gilbarbara/logos/master/logos.json) 

# Parse the JSON data and extract the array of objects without using jq
json_array=$(echo $json_data | grep -o '\[.*\]' | sed 's/},/},\'$'\n/g')

# Create a TypeScript file
echo "export const rawSvgPorn = " > "src\data\svg-porn.ts"

# Iterate through the array of objects and add them to the TypeScript file
while read -r line; do
  echo $line >> "src\data\svg-porn.ts"
done <<< "$json_array"

# Close the TypeScript file with a semicolon and a new line
echo ";" >> "src\data\svg-porn.ts"
