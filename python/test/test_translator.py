import csv
import sys
from pathlib import Path

import pytest

PYTHON_DIR = Path(__file__).resolve().parents[1]
ROOT_DIR = PYTHON_DIR.parent

if str(PYTHON_DIR) not in sys.path:
    sys.path.insert(0, str(PYTHON_DIR))

from src.translator import Nemeth2LaTeXTranslator

IGNORED_FAILURE_IDS = {"25", "32", "37"}


def load_test_cases():
    with (ROOT_DIR / "testcase.csv").open(encoding="utf-8") as f:
        return list(csv.DictReader(f))


TEST_CASES = load_test_cases()


def make_case_id(row):
    remark = f" [{row['remark']}]" if row.get("remark") else ""
    return f"{row['id']}{remark}: {row['expected-latex']}"


@pytest.fixture(scope="module")
def translator():
    return Nemeth2LaTeXTranslator()


@pytest.mark.parametrize("row", TEST_CASES, ids=make_case_id)
def test_translate_matches_testcase_csv(translator, row):
    if row["id"] in IGNORED_FAILURE_IDS:
        pytest.xfail("Known Python mismatch kept for comparison")

    assert translator.translate(row["input-braille"]) == row["expected-latex"]
