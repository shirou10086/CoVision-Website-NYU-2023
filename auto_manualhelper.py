import csv

# Define the input and output CSV file names
input_csv_file = './static/dataset/Auto/MasterGroundTruth.csv'
output_csv_file = 'Auto_output.csv'

# Open the input CSV file and read its contents
with open(input_csv_file, mode='r', newline='', encoding='utf-8') as infile:
    # Try to automatically detect the delimiter
    dialect = csv.Sniffer().sniff(infile.read(1024))
    infile.seek(0)  # Reset file read position after sniffing
    reader = csv.reader(infile, dialect=dialect)

    # Skip the header row
    next(reader)

    # Open the output CSV file where we will write the reformatted data
    with open(output_csv_file, mode='w', newline='', encoding='utf-8') as outfile:
        writer = csv.writer(outfile, delimiter=',')

        # Iterate over each row of the input CSV
        for row in reader:
            try:
                # Extract information from the image_1 and image_2 paths
                image_1_parts = row[0].split('/')
                image_2_parts = row[1].split('/')
                scene = image_1_parts[3]
                floor = image_1_parts[4]
                image1 = image_1_parts[-1].split('_')[-1].split('.')[0]
                image2 = image_2_parts[-1].split('_')[-1].split('.')[0]
                label = row[2]

                # Write the reformatted data to the output CSV
                writer.writerow([scene, floor, image1, image2, label])
            except IndexError:
                # Print a warning or pass
                print(f"Skipping row due to IndexError: {row}")
                continue

print(f'Reformatted CSV data has been written to {output_csv_file}')
