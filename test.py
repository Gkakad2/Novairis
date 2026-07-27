from collector.discovery import Discovery

client = Discovery(
        host="192.168.175.197",
        user="esec"
)

results = client.collect()

for section, output in results.items():
    print("=" * 70)
    print(section.upper())
    print("=" * 70)
    print(output)
