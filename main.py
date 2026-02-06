import csv
import sys

from nemeth.translator import Nemeth2LaTeXTranslator

if __name__ == '__main__':
	nemeth2latexObj = Nemeth2LaTeXTranslator()

	test_path = sys.argv[1]
	result_path = sys.argv[2]

	with open(test_path, 'r', encoding='utf-8') as test_file, open(result_path, 'w', encoding='utf-8', newline='') as result_file:
		test_dict_csv = csv.DictReader(test_file)
		result_dict_csv = csv.DictWriter(result_file, fieldnames=["id", "input-braille", "expected-latex", "output-latex", "result"])
		result_dict_csv.writeheader()

		for row in test_dict_csv:
			try:
				latex = nemeth2latexObj.translate(row["input-braille"])
			except BaseException as e:
				print("error:", row["expected-latex"])
				data = {
					"id": row["id"],
					"input-braille": row["input-braille"],
					"expected-latex": row["expected-latex"],
					"output-latex": "parse error",
					"result": False,
				}
				result_dict_csv.writerow(data)
				continue
			data = {
				"id": row["id"],
				"input-braille": row["input-braille"],
				"expected-latex": row["expected-latex"],
				"output-latex": latex,
			}
			if not latex == row["expected-latex"]:
				data["result"] = False
				print("l:", latex)
			else:
				data["result"] = True
			result_dict_csv.writerow(data)
