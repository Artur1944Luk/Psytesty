# Psytesty

Aplikacja z testami psychologicznymi. Statyczna strona: HTML, CSS i JavaScript,
bez serwera, bez bazy danych, bez kont użytkowników.

**Wersja na żywo:** https://artur1944luk.github.io/Psytesty/

> Ten plik jest jedynym źródłem zasad projektu. Jeśli czytasz go jako asystent
> w nowej sesji: przeczytaj go w całości przed pierwszą zmianą w kodzie.
> Sekcje „Decyzje projektowe", „Zasady, których nie wolno łamać" i „Jak pracujemy"
> są wiążące. Nie zmieniaj ich bez wyraźnej zgody właściciela projektu.

---

## 1. Kontekst

Projekt powstaje dla psycholog **Anety Podolskiej-Kamińskiej** i jest częścią
szerszego przedsięwzięcia **„Rozbieramy Prawdę"**. Artur wchodzi w nie jako
konsultant, partner biznesowy i fotograf. Psytesty to moduł testów,
rozwijany osobno od reszty.

Odbiorcą końcowym jest osoba dorosła, która wypełnia kwestionariusz w celu
refleksji nad sobą — często w sytuacji emocjonalnie niełatwej. Z tego wynika
większość decyzji dotyczących treści i wyglądu.

---

## 2. Zasady, których nie wolno łamać

Te cztery punkty mają pierwszeństwo przed wygodą, estetyką i terminem.

### 2.1. Żadne dane nie opuszczają przeglądarki

Odpowiedzi i wyniki zapisują się wyłącznie w `localStorage` urządzenia
użytkownika. Aplikacja **nie wysyła niczego** na żaden serwer: nie ma
analityki, nie ma zbierania statystyk, nie ma formularzy kontaktowych
przekazujących treść odpowiedzi.

Powód jest prawny, nie estetyczny. Wyniki testów psychologicznych mogą
stanowić dane o zdrowiu w rozumieniu **art. 9 RODO**, czyli dane szczególnej
kategorii. Dopóki nic nie jest wysyłane ani przechowywane po naszej stronie,
problem praktycznie nie istnieje.

**Zmiana tego wymaga świadomej decyzji właściciela projektu.** Zbieranie
wyników — choćby po to, żeby Aneta mogła je zobaczyć — oznacza: podstawę
prawną i zgody, rejestr czynności przetwarzania, umowę powierzenia z hostingiem,
politykę retencji, obsługę praw osób (dostęp, usunięcie), zabezpieczenie
transmisji i spoczynku. Nie wolno dodać takiej funkcji „przy okazji".

### 2.2. Tylko testy autorskie albo z domeny publicznej

Publikujemy wyłącznie kwestionariusze własnego autorstwa (Anety) lub
bezspornie wolne, np. pule **IPIP**.

**Nie wolno dodać** testów licencjonowanych: MMPI, BDI, testów Pracowni Testów
Psychologicznych PTP i podobnych. Dotyczy to również „własnych przeróbek"
i tłumaczeń takich narzędzi — one też są zależne od oryginału.

Jeśli pochodzenie testu jest niejasne, decyduje Aneta. Przy braku pewności
test nie trafia do repozytorium.

### 2.3. Nic poufnego w repozytorium

Repozytorium jest **publiczne**, a historia Gita zachowuje wszystko na zawsze.
Plik usunięty w kolejnym commicie nadal da się odczytać w poprzedniej wersji.

Do repozytorium nie trafiają: hasła i dane FTP, klucze API, prywatne notatki,
robocze teksty Anety nieprzeznaczone do publikacji, dane jakichkolwiek osób.
Sekrety potrzebne automatyzacji idą do *Settings → Secrets and variables*,
nigdy do plików.

### 2.4. Komunikacja z użytkownikiem ma być bezpieczna psychologicznie

W interfejsie zawsze muszą być obecne:

- informacja, że **nie ma dobrych ani złych odpowiedzi**,
- informacja, że **test można przerwać w dowolnym momencie**,
- informacja, że **wynik jest orientacyjny i nie zastępuje rozmowy ze specjalistą**,
- przy wyniku: że **styl/cecha nie jest diagnozą ani etykietą na całe życie**.

Nie używamy sformułowań diagnostycznych ani oceniających. Nie ma punktacji
„im więcej, tym lepiej", nie ma rankingów, nie ma presji czasu, nie ma
licznika odliczającego.

---

## 3. Decyzje projektowe

### 3.1. Architektura: strona statyczna sterowana plikami JSON

| Decyzja | Uzasadnienie |
|---|---|
| Brak backendu i bazy danych | Nie ma czego zabezpieczać, hosting jest darmowy, RODO upraszcza się do minimum |
| Treść testów w plikach JSON | Dodanie testu nie wymaga zmian w kodzie |
| Brak frameworków i bibliotek | Jedna zależność zewnętrzna (fonty Google), strona działa latami bez aktualizacji |
| Jeden silnik dla wszystkich testów | Poprawka działa od razu we wszystkich testach |

**Silnik nie może zawierać treści żadnego testu.** Jeśli nowy test wymaga
czegoś, czego nie da się opisać w JSON, rozszerzamy format JSON, a nie
dopisujemy wyjątek w kodzie.

### 3.2. Hosting

GitHub Pages, gałąź `main`, katalog `/ (root)`. Ustawienia: *Settings → Pages*.
Na darmowym planie GitHub Pages wymaga repozytorium publicznego — stąd
publiczny status repo i stąd punkt 2.3.

Wariant zapasowy, gdyby repo miało wrócić do prywatnego: publikacja na serwer
Artura w **home.pl** przez FTP, wyzwalana przez GitHub Actions, z danymi
dostępowymi w *Secrets*.

Uwaga: adres rozróżnia wielkość liter. Działa `/Psytesty/`, `/psytesty/` zwraca 404.

### 3.3. Wygląd

Kierunek: **spokojna poczekalnia, nie gabinet kliniczny**. Jeden motyw
ozdobny, reszta wyciszona.

**Paleta** — chłodna i przygaszona. Zmienne w `assets/app.css`:

| Zmienna | Jasny | Rola |
|---|---|---|
| `--paper` | `#EDEFF4` | tło strony |
| `--surface` | `#FAFBFD` | karty |
| `--ink` | `#262A38` | tekst |
| `--calm` | `#4F6D8F` | kolor wiodący, przyciski, zaznaczenie |
| `--sage` | `#5F8578` | wymiar „unikanie", komunikaty uspokajające |
| `--heather` | `#8E6B88` | wymiar „lęk", ostrzeżenia |

**Czerwień i pomarańcz są wykluczone.** W teście psychologicznym czytają się
jak alarm. Ostrzeżenia idą na wrzosie (`--heather`), nie na czerwieni.

Świadomie odrzucono kremowe tło z ciepłym pomarańczowym akcentem — to dziś
najczęstszy, bezosobowy domyślny styl stron generowanych przez AI.

**Typografia** — dwa kroje z Google Fonts, oba z pełnym zestawem polskich
znaków diakrytycznych:

- **Literata** — stwierdzenia testu i nagłówki. Krój zaprojektowany do
  długiego czytania.
- **IBM Plex Sans** — interfejs, etykiety, liczby.

**Tryb ciemny** działa automatycznie według ustawień systemu. Każda nowa
zmienna koloru musi mieć wariant w bloku `prefers-color-scheme: dark`.

**Ozdobniki** — koncentryczne okręgi w tle, krycie 8,5% (13% w trybie ciemnym),
motyw kręgów na wodzie. To jedyny ozdobnik w projekcie. Nowych nie dodajemy
bez usunięcia starego.

### 3.4. Czytelność — wymagania twarde

Wynikają z realnych uwag zgłoszonych przy pierwszej wersji.

- **Skala odpowiedzi to pełnowymiarowe wiersze, nie siatka cyfr.** Każdy
  stopień ma widoczny numer **i pełną nazwę słowną**. Nigdy nie wracamy do
  wąskich kwadracików z samymi cyframi i podpisami tylko na końcach skali.
- **Minimalna wysokość pola klikalnego: 54 px.** Ma być trafialne palcem.
- **Treść stwierdzenia: 22 px** (20 px na wąskich ekranach).
- **Numer pytania w rozmiarze tekstu podstawowego**, nie w przypisie.
- **Żaden istotny tekst poniżej 14 px.** Podpisy skali to nie jest miejsce
  na drobny szary druk.
- Długość wiersza do około 48 znaków.

### 3.5. Dostępność

- Widoczna obwódka przy nawigacji klawiaturą (`:focus-visible`).
- Klawisze `1`–`7` wybierają odpowiedź w trakcie testu.
- `prefers-reduced-motion` wyłącza animacje.
- Mapa wyniku ma opis `aria-label` z wartościami liczbowymi.
- Kolor nigdy nie jest jedynym nośnikiem informacji.

### 3.6. Wydruk i PDF

Przycisk na stronie wyniku wywołuje `window.print()`. Celowo **bez zewnętrznej
biblioteki PDF** — przeglądarki robią to lepiej, a strona zostaje lekka.

Arkusz `@media print` w `assets/app.css`:
wymusza jasne kolory niezależnie od trybu ciemnego, usuwa tło, przyciski
i nawigację, dodaje nagłówek z tytułem i datą, przenosi pełną listę odpowiedzi
na osobną stronę, dodaje stopkę z identyfikatorem wyniku i zastrzeżeniem.
Paski wymiarów mają `print-color-adjust: exact`, żeby wydrukowały się
w kolorze.

### 3.7. Zgodność z przeglądarkami

**Dolna granica: Chrome 109** — ostatnia wersja dostępna na Windows 8.1,
z którego korzysta Artur na laptopie CLEVO.

W praktyce oznacza to: bez funkcji CSS i JS nowszych niż początek 2023 roku.
Nie używamy `:has()`, zagnieżdżania CSS ani składni, której Chrome 109 nie zna.
Dozwolone i sprawdzone: `fetch`, `Promise`, `inset`, `:focus-visible`, `min()`,
`String.padStart`.

---

## 4. Struktura plików

```
index.html              strona startowa; listę testów buduje z testy/index.json
test.html               silnik; uruchamiany jako test.html?id=<id>
assets/
  app.css               wszystkie style, razem z arkuszem wydruku
  engine.js             wyświetlanie, punktacja, zapis, wydruk
testy/
  index.json            katalog testów widocznych na stronie startowej
  przywiazanie.json     definicja testu stylu przywiązania
  test-przywiazania.html  stary adres, przekierowuje na test.html?id=przywiazanie
CLAUDE.md               wskazuje asystentowi ten plik
.nojekyll               wyłącza przetwarzanie Jekyll w GitHub Pages
README.md               ten plik
```

---

## 5. Jak dodać nowy test

1. Utwórz `testy/<id>.json` według wzoru niżej. Identyfikator: małe litery,
   cyfry i myślniki, np. `samoocena`.
2. Dopisz test do `testy/index.json`.
3. Zatwierdź zmiany. Po 1–2 minutach test pojawi się na stronie startowej.

Plików `index.html`, `test.html`, `app.css` ani `engine.js` **nie trzeba
przy tym dotykać**. Jeśli trzeba — patrz punkt 3.1.

### Wzór pliku testu

```jsonc
{
  "id": "samoocena",
  "title": "Nazwa testu",
  "short": "Jedno zdanie na kartę na stronie startowej.",
  "intro": "Dwa, trzy zdania na stronie startowej testu.",
  "minutes": 5,
  "source": "Skąd pochodzi test — wymagane, patrz punkt 2.2.",
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
  "scoring": { },
  "closing": "Zdanie pod wynikiem.",
  "items": [
    { "d": "sam", "r": false, "q": "Treść stwierdzenia." },
    { "d": "sam", "r": true,  "q": "Stwierdzenie punktowane odwrotnie." }
  ]
}
```

Pozycje: `d` to klucz wymiaru, `q` to treść, `r: true` oznacza pozycję
odwróconą (liczoną jako `min + max − odpowiedź`).
`color` przyjmuje `sage`, `heather` lub `calm`.
Każda skala musi mieć tyle etykiet w `labels`, ile jest stopni od `min` do `max`.

### Punktacja A: dwa wymiary, cztery ćwiartki

Silnik rysuje wtedy mapę dwóch osi. Wymagane dokładnie dwa wymiary i cztery
wyniki pokrywające wszystkie kombinacje `low`/`high`. `threshold` to próg
w procentach, domyślnie 50.

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

### Punktacja B: jeden wymiar, przedziały

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

---

## 6. Praca lokalna

Strona wczytuje pliki JSON, więc **otwarcie `index.html` podwójnym kliknięciem
nie zadziała** — przeglądarki blokują wczytywanie JSON z adresu `file://`.
Strona wykrywa tę sytuację i pokazuje zrozumiały komunikat zamiast pustego ekranu.

Lokalnie trzeba uruchomić prosty serwer:

```
python3 -m http.server 8000
```

i otworzyć `http://localhost:8000`. Przez GitHub Pages działa normalnie.

---

## 7. Jak pracujemy

Zasady współpracy Artura z asystentem w tym repozytorium.

- **Język:** polski, w kodzie i w komentarzach również.
- **Odpowiedzi:** technicznie rzetelne i szczegółowe, bez upraszczania.
  Ograniczenia i skutki uboczne trzeba nazwać wprost, zanim zostaną wdrożone.
- **Asystent ma prawo zapisu** do repozytorium i commituje bezpośrednio
  na `main`. Nie odsyłamy Artura do ręcznego wgrywania plików.
- **Weryfikacja przed wysłaniem.** Zmianę w interfejsie sprawdzamy w
  przeglądarce (Playwright, Chromium jest w środowisku pod
  `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`) w czterech wariantach:
  jasny, ciemny, desktop, telefon. Zmianę w wydruku — wygenerowanym PDF-em.
  Dopiero potem commit.
- **Opisy commitów po polsku**, w trybie rzeczownikowym, z wypunktowaniem
  istotnych zmian.
- **Zmiana decyzji z punktu 2 lub 3 wymaga zgody Artura** i aktualizacji
  tego pliku w tym samym commicie.

---

## 8. Stan i znane ograniczenia

Stan na październik 2026.

**Gotowe:** silnik sterowany JSON-em, test stylu przywiązania (36 pozycji,
dwa wymiary), historia wyników w przeglądarce, mapa dwóch wymiarów na stronie
wyniku, wydruk i zapis do PDF, tryb ciemny, publikacja na GitHub Pages.

**Ograniczenia, z których zdajemy sobie sprawę:**

- Historia wyników jest przypisana do jednej przeglądarki na jednym
  urządzeniu. Wynik zrobiony w domu nie będzie widoczny w pracy.
  To bezpośrednia konsekwencja punktu 2.1 i na razie akceptujemy ten koszt.
- Edycja plików JSON przez osobę nietechniczną jest ryzykowna — jeden zgubiony
  przecinek psuje test. Docelowo Aneta pisze treść w zwykłym dokumencie,
  a ktoś przenosi ją do JSON-a. Alternatywą byłby prosty panel edycji
  w aplikacji; nie został jeszcze zbudowany.
- Jedna zależność zewnętrzna: fonty z Google Fonts. Przy braku sieci strona
  zadziała na krojach zastępczych.

**Do rozważenia w przyszłości:** kolejne testy, zaproszenie Anety jako
współpracownika repozytorium, panel edycji treści, własna domena.
