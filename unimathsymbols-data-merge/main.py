import pandas as pd


count = 0

def uscheck(row):
	global count
	try:
		if row["code"] == hex(ord(row["symbol"]))[2:].upper().rjust(5, "0"):
			return True
		else:
			return False
	except BaseException as e:
		print(row['code'])
		print(row['symbol'])
		count += 1
		return False

def code2symbol(cell):
	return chr(int(cell, 16))

def code_clean(cell):
	return cell.rjust(5, "0")


def latex(row):
	if pd.isnull(row["latex"]):
		return row["latex1"]
	else:
		return row["latex"]

df = pd.read_csv("unimathsymbols.txt", sep="^", dtype={'code': str})
# df["uscheck"] = df.apply(uscheck, axis=1)
# df = df.drop("comments", axis=1)
df = df.drop("symbol", axis=1)
all = pd.read_csv("data.csv")
all["code"] = all["code"].apply(code_clean)
df = pd.merge(all, df, how="outer", left_on=["code"], right_on=["code"])
df["symbol"] = df["code"].apply(code2symbol)
df["priority"] = df["priority"].fillna(0).astype(int)
df["latex"] = df.apply(latex, axis=1)
df = df[["latex", "code", "symbol", "nemeth", "source", "priority"]]
df.to_csv("symbol.csv", index=False)
