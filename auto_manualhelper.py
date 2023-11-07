import csv

# Define the input and output CSV file names
input_csv_file = 'Manually_merged_GroundTruth.csv'
output_csv_file = 'Manually_output.csv'

# Open the input CSV file and read its contents
with open(input_csv_file, mode='r', newline='', encoding='utf-8') as infile:
    # Try to automatically detect the delimiter
    dialect = csv.Sniffer().sniff(infile.read(1024))
    infile.seek(0)  # Reset file read position after sniffing
    reader = csv.DictReader(infile, dialect=dialect)

    # Open the output CSV file where we will write the reformatted data
    with open(output_csv_file, mode='w', newline='', encoding='utf-8') as outfile:
        fieldnames = ['scene', 'floor', 'image1', 'image2', 'label']
        writer = csv.DictWriter(outfile, fieldnames=fieldnames, delimiter=',')

        writer.writeheader()  # Write the header to the output CSV

        # Print the fieldnames to help with debugging
        print(f"Fieldnames in the CSV: {reader.fieldnames}")

        # Iterate over each row of the input CSV
        for row in reader:
            # Extract scene and floor from the file path in image_1
            parts = row['image_1'].split('/')
            scene = parts[3]
            floor = parts[4]

            # Extract image numbers
            image1 = row['image_1'].split('/')[-1].split('_')[-1].split('.')[0]
            image2 = row['image_2'].split('/')[-1].split('_')[-1].split('.')[0]
            label = row['label']

            # Write the reformatted data to the output CSV
            writer.writerow({
                'scene': scene,
                'floor': floor,
                'image1': image1,
                'image2': image2,
                'label': label
            })

print(f'Reformatted CSV data has been written to {output_csv_file}')
