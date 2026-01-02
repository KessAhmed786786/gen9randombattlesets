import csv
import json

def convert_csv_to_pokemon_json(csv_file_path, json_file_path):
    pokemon_dict = {}
    
    # Define which columns should be converted into Arrays
    array_columns = [
        "abilities", "types", "HP", "Attack", "Defense", "Special Atk", "Special Def", "Speed", "BST"
    ]

    with open(csv_file_path, encoding='utf-8') as csvf:
        csv_reader = csv.DictReader(csvf)
        
        for row in csv_reader:
            name = row.pop("pokemon") # Remove Name to use as the main Key
            
            # Process each column
            for key, value in row.items():
                # Convert numeric strings to actual numbers
                if value.isdigit():
                    row[key] = int(value)
                
                # Turn comma-separated strings into Arrays
                elif key in array_columns:
                    if value.strip(): # If the cell isn't empty
                        row[key] = [item.strip() for item in value.split(",")]
                    else:
                        row[key] = [] # Return empty array if cell is blank
            
            pokemon_dict[name] = row

    # Save to JSON file
    with open(json_file_path, 'w', encoding='utf-8') as jsonf:
        json.dump(pokemon_dict, jsonf, indent=2)

# Run the function
convert_csv_to_pokemon_json('pokemon_data.csv', 'data.json')