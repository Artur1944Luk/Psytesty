# Psytesty

Prosta aplikacja z testami psychologicznymi (projekt Aneta / Rozbieramy Prawdę).

## Struktura

```
index.html                  strona startowa z listą testów
testy/                      każdy test jako osobny plik HTML
  test-przywiazania.html    test stylu przywiązania (36 pozycji, 2 wymiary)
.nojekyll                   wyłącza przetwarzanie Jekyll w GitHub Pages
```

## Zasady

- Aplikacja jest statyczna: HTML + CSS + JavaScript, bez serwera i bazy danych.
- Odpowiedzi i wyniki zapisują się tylko w przeglądarce użytkownika (localStorage).
  Nic nie jest wysyłane — ważne ze względu na RODO (wyniki testów psychologicznych
  mogą być danymi o zdrowiu, art. 9).
- Publikujemy wyłącznie testy autorskie lub z domeny publicznej (np. IPIP).
  Testy licencjonowane (MMPI, BDI, testy PTP itp.) nie mogą się tu znaleźć.

## Dodawanie testu

1. W folderze `testy/`: *Add file → Upload files* (lub *Create new file*).
2. W `index.html` skopiuj blok `<a class="card">` i podmień link, tytuł i opis.
3. *Commit changes* — strona zaktualizuje się po 1–2 minutach.

## Publikacja

GitHub Pages (wymaga repozytorium publicznego na darmowym planie):
*Settings → Pages → Branch: main, folder: / (root) → Save*.
