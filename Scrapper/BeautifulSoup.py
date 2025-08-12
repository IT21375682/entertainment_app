import requests
from bs4 import BeautifulSoup

url = "https://www.espn.com/"
html = requests.get(url).text
soup = BeautifulSoup(html, 'html.parser')

for headline in soup.select("section h1"):  # Adjust selector
    print(headline.text.strip())
