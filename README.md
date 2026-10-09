# Psytesty

Aplikacja z testami psychologicznymi (projekt Aneta / Rozbieramy Prawdę).
Statyczna strona: HTML, CSS i JavaScript, bez serwera i bez bazy danych.

Wersja na żywo: https://artur1944luk.github.io/Psytesty/

## Struktura

```
index.html              strona startowa — listę testów buduje z testy/index.json
test.html               silnik testów — uruchamiany jako test.html?id=<id testu>
assets/
  app.css               wszystkie style, razem z arkuszem wydruku
  engine.js             logika testu: wyświetlanie, punktacja, zapis, wydruk
testy/
  index.json            katalog testów widocznych na stronie startowej
  przywiazanie.json     definicja testu stylu przywiązania
  test-przywiazania.html  stary adres, przekierowuje na test.html?id=przywiazanie
.nojekyll               wyłącza przetwarzanie Jekyll w GitHub Pages
```

Treść testów jest w plikach JSON. **Dodanie testu nie wymaga zmian w kodzie.**

## Jak dodać nowy test

1. Utwórz `testy/<id>.json` według wzoru poniżej. Identyfikator: małe litery,
   cyfry i myślniki, np. `samoocena`.
2. Dopisz test do `testy/index.json`.
3. Zatwierdź zmiany. Po 1–2 minutach test pojawi się na stronie startowej.

### Wzór pliku testu

```jsonc
{
  "id": "samoocena",
  "title": "Nazwa testu",
  "short": "Jedno zdanie na kartę na stronie startowej.",
  "intro": "Dwa, trzy zdania na stronie startowej testu.",
  "minutes": 5,
  "prompt": "Na ile to zdanie pasuje do Ciebie?",
  "scale": {
    "min": 1,
    "max": 5,
    "labels": ["zdecydowanie nie", "raczej nie", "trudno powiedzieć",
               "raczej tak", "zdecydowanie tak"]
  },
  "dimensions": [
    { "key": "sam", "name": "Samoocena", "short": "samoocena",
      "note": "Zdanie wyjaśniające, co mierzy ten wymiar.",
      "color": "sage" }
  ],
  "scoring": { },        // patrz niżej
  "closing": "Zdanie pod wynikiem.",
  "items": [
    { "d": "sam", "r": false, "q": "Treść stwierdzenia." },
    { "d": "sam", "r": true,  "q": "Stwierdzenie punktowane odwrotnie." }
  ]
}
```

Pola pozycji: `d` to klucz wymiaru, `q` to treść, `r: true` oznacza pozycję
odwróconą (wartość liczona jako `min + max − odpowiedź`).
`color` przyjmuje `sage`, `heather` lub `calm`.

### Punktacja: dwa wymiary (cztery ćwiartki)

Silnik rysuje wtedy mapę dwóch osi. Wymagane dokładnie dwa wymiary i cztery
wyniki pokrywające wszystkie kombinacje `low`/`high`. `threshold` to próg w
procentach (domyślnie 50).

```jsonc
"scoring": {
  "type": "quadrant",
  "x": "avo", "y": "anx", "threshold": 50,
  "results": [
    { "when": { "anx": "low",  "avo": "low"  }, "name": "…", "desc": "…" },
    { "when": { "anx": "high", "avo": "low"  }, "name": "…", "desc": "…" },
    { "when": { "anx": "low",  "avo": "high" }, "name": "…", "desc": "…" },
    { "when": { "anx": "high", "avo": "high" }, "name": "…", "desc": "…" }
  ]
}
```

### Punktacja: jeden wymiar (przedziały)

```jsonc
"scoring": {
  "type": "bands",
  "dimension": "sam",
  "results": [
    { "from": 0,  "to": 33,  "name": "Niska",   "desc": "…" },
    { "from": 34, "to": 66,  "name": "Średnia", "desc": "…" },
    { "from": 67, "to": 100, "name": "Wysoka",  "desc": "…" }
  ]
}
```

## Zasady projektu

- Odpowiedzi i wyniki zapisują się wyłącznie w przeglądarce użytkownika
  (`localStorage`). Nic nie jest nigdzie wysyłane. Jest to istotne ze względu
  na RODO: wyniki testów psychologicznych mogą być danymi o zdrowiu (art. 9).
- Publikujemy wyłącznie testy autorskie lub z domeny publicznej (np. IPIP).
  Testy licencjonowane (MMPI, BDI, testy Pracowni PTP) nie mogą się tu znaleźć.
- Wynik można zapisać jako PDF lub wydrukować — przyciskiem na stronie wyniku.
  Wydruk obejmuje wynik, mapę wymiarów i pełną listę odpowiedzi.

## Praca lokalna

Strona wczytuje pliki JSON, więc otwarcie `index.html` podwójnym kliknięciem
(adres `file://`) nie zadziała — przeglądarki blokują w tym trybie takie
wczytywanie. Lokalnie trzeba uruchomić prosty serwer:

```
python3 -m http.server 8000
```

i otworzyć `http://localhost:8000`. Przez GitHub Pages działa normalnie.

## Publikacja

GitHub Pages, gałąź `main`, katalog `/ (root)`.
Ustawienia: *Settings → Pages*. Wymaga repozytorium publicznego na darmowym planie.
