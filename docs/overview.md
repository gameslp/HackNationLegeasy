Legeasy

Tworzymy serwis do obserwowania procesu legislacyjnego w Polsce.

Ustawa będzie posiadała:
- Nazwę
- Autora - Wnioskodawca
- Opis
- Datę rozpoczęcia
- Datę publikacji

Faza zawiera:
- Typ (Enum)
- Ustawa (Id)
- Data rozpoczęcia
- Data zakończenia

Każdy taki proces będzie w postaci kolejnych etapów opisujących stan projektu ustawy. Stan (etap) zawiera:
- Nazwe
- Fazę (Id)
- Data
- Autor
- Linki do stron rządowych
- Plik ustawy (kolejne zmieniane pliki pdf)
- Plik ustawy tekstowo (pliki ustawy wyplute do txt, dla obsługi przez nasz system git-like)
- Pliki powiązane (per etap)
- Opis
- Dyskusję użytkowników (Osobna tabela)

Fazy: Prekonsultacje (możliwe) - RCL - Sejm - Senat - Prezydent - Dziennik ustaw (Wdrożone)

Proces może się zacząć fazą prekonsultacji, zawierającą pod-etapy:
- Wstępny projekt ustawy i założeń
- Dyskusja - zbieranie opinii, uwag, poprawek w formie tekstu
- Gotowa ustawa początkowa spisana przez rozpoczynającego projekt

Scrapowanie ze stron RCL, sejm i senat jest niemożliwe ze względu na skomplikowanie systemu. Administracje (crud) obsługuje użytkownik (urzędnik) z panelu administracyjnego. Może tworzyć ustawy. Do ustawy może dodawać fazy, i do każdej fazy etapy. Zgodnie z tabelkami opisanymi powyżej.

Drugim rodzajem użytkownika jest obywatel, który może wyświetlać dane dodane przez administrującego. Read-only. Ekran Ustaw -> Ekran Wyboru Fazy -> Ekran Fazy, który zawiera etapy, wyświetlające dane etapu + pliki zamieszczone.

Kolejne etapy ustawy mają przypominać system git, polegający na kontroli wersji głównego pliku ustawy (zmiany operujące na pliku txt) oraz przechowywania plików powiązanych - specyficzne dla etapu. Możliwe jest porównywanie wersji ustawy między etapami niesąsiadującymi, tzn. Istnieje podgląd zmian w ustawie na przestrzeni etapów.

Jako dodatkowa funkcja, pozwalamy użytkownikom włączyć analizę na danym etapie (jego dane, pliki i zmiany wprowadzone), (analiza jednego pliku lub całego etapu), pomagającego w jasnym zrozumieniu zmian i możliwych efektów. 

