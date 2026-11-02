"""Presidential terms for chart shading.

Dates are inauguration and succession dates, not statistical measurements.
January 20 inaugurations follow the Twentieth Amendment. Earlier regular
inaugurations were March 4. Succession dates are the dates the prior president
died or resigned.
Source: https://www.archives.gov/founding-docs/amendments-11-27
and the National Archives list of presidents.
"""

from __future__ import annotations

TERMS = [
    {"name": "Woodrow Wilson", "party": "Democratic", "start": "1913-03-04", "end": "1921-03-04"},
    {"name": "Warren G. Harding", "party": "Republican", "start": "1921-03-04", "end": "1923-08-02"},
    {"name": "Calvin Coolidge", "party": "Republican", "start": "1923-08-02", "end": "1929-03-04"},
    {"name": "Herbert Hoover", "party": "Republican", "start": "1929-03-04", "end": "1933-03-04"},
    {"name": "Franklin D. Roosevelt", "party": "Democratic", "start": "1933-03-04", "end": "1945-04-12"},
    {"name": "Harry S. Truman", "party": "Democratic", "start": "1945-04-12", "end": "1953-01-20"},
    {"name": "Dwight D. Eisenhower", "party": "Republican", "start": "1953-01-20", "end": "1961-01-20"},
    {"name": "John F. Kennedy", "party": "Democratic", "start": "1961-01-20", "end": "1963-11-22"},
    {"name": "Lyndon B. Johnson", "party": "Democratic", "start": "1963-11-22", "end": "1969-01-20"},
    {"name": "Richard Nixon", "party": "Republican", "start": "1969-01-20", "end": "1974-08-09"},
    {"name": "Gerald Ford", "party": "Republican", "start": "1974-08-09", "end": "1977-01-20"},
    {"name": "Jimmy Carter", "party": "Democratic", "start": "1977-01-20", "end": "1981-01-20"},
    {"name": "Ronald Reagan", "party": "Republican", "start": "1981-01-20", "end": "1989-01-20"},
    {"name": "George H. W. Bush", "party": "Republican", "start": "1989-01-20", "end": "1993-01-20"},
    {"name": "Bill Clinton", "party": "Democratic", "start": "1993-01-20", "end": "2001-01-20"},
    {"name": "George W. Bush", "party": "Republican", "start": "2001-01-20", "end": "2009-01-20"},
    {"name": "Barack Obama", "party": "Democratic", "start": "2009-01-20", "end": "2017-01-20"},
    {"name": "Donald Trump", "party": "Republican", "start": "2017-01-20", "end": "2021-01-20"},
    {"name": "Joe Biden", "party": "Democratic", "start": "2021-01-20", "end": "2025-01-20"},
    {"name": "Donald Trump", "party": "Republican", "start": "2025-01-20", "end": None},
]

SOURCE_URL = "https://www.archives.gov/founding-docs/amendments-11-27"
NOTE = (
    "Background bands mark who was president. They are not an attribution of cause. "
    "Presidents do not solely control these metrics. "
    "Monthly points use the president in office on the first day of the month. "
    "Calendar year points use the president in office on July 1. "
    "Fiscal year points use the president in office on October 1, the first day of that fiscal year. "
    "A fiscal year runs through the following September 30 and can include two presidents."
)


def payload() -> dict:
    return {
        "source_url": SOURCE_URL,
        "source_name": "National Archives, Constitution of the United States: Amendments 11-27",
        "note": NOTE,
        "terms": TERMS,
    }
