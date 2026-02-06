# nemeth2latex

Convert Nemeth Braille math expressions into LaTeX.

This project provides:
- A Python translator (`Nemeth2LaTeXTranslator`)
- A CSV-based command-line workflow for batch conversion and validation
- Data-driven symbol/letter/number mapping tables

## What This Repository Is For

If you have Nemeth Braille strings (for example from a dataset or transcription process), this tool parses them and outputs LaTeX expressions.

The parser is built with `lark`, and token mappings are maintained in CSV files under `nemeth/data/`.

## Project Structure

- `main.py`: batch runner that reads an input CSV and writes conversion results to an output CSV
- `nemeth/translator.py`: high-level translator class
- `nemeth/grammar.py`: Lark grammar for Nemeth expressions
- `nemeth/transformer.py`: parse-tree to LaTeX transformer
- `nemeth/data/*.csv`: symbol, letter, and number mapping tables
- `testcase.csv`, `testcase2.csv`: example datasets
- `unimathsymbols-data-merge/`: helper scripts/data for symbol table preparation

## Requirements

- Python 3.8+
- Dependencies in `requirements.txt`

Install dependencies:

```bash
pip install -r requirements.txt
```

## Quick Start (Batch CSV Mode)

Run the provided testcase:

```bash
python main.py testcase.csv result.csv
```

This command:
1. Reads each row from `testcase.csv`
2. Converts `input-braille` to LaTeX
3. Compares the output with `expected-latex`
4. Writes results to `result.csv`

## Input and Output CSV Format

### Input CSV columns

- `id`
- `input-braille`
- `expected-latex`

Example input row:

```csv
1,⠹⠆⠤⠂⠌⠒⠘⠆⠼,\frac{2-1}{3^2}
```

### Output CSV columns

- `id`
- `input-braille`
- `expected-latex`
- `output-latex`
- `result` (True/False)

If parsing fails for a row, `output-latex` is written as `parse error`.

## Use as a Python Library

```python
from nemeth.translator import Nemeth2LaTeXTranslator

translator = Nemeth2LaTeXTranslator()
latex = translator.translate("⠁⠘⠆")  # a^2
print(latex)
```

## Notes and Limitations

- Supported patterns are defined by the grammar and mappings in `nemeth/`.
- Ambiguous Nemeth symbols are resolved by mapping priority in the CSV tables.
- If your input includes unsupported patterns, translation may fail with a parse error.

## Development Tips

- To add or adjust symbol behavior, edit files in `nemeth/data/`.
- If needed, use scripts in `unimathsymbols-data-merge/` to help regenerate mapping data.
