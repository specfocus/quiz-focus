// C# program for Finite Automata Pattern
// searching Algorithm
using System;

class GFG
{

public static int NO_OF_CHARS = 256;
public static int getNextState(char[] pat, int M,
							int state, int x)
{

	// If the character c is same as next
	// character in pattern,then simply
	// increment state
	if (state < M && (char)x == pat[state])
	{
		return state + 1;
	}

	// ns stores the result
	// which is next state
	int ns, i;

	// ns finally contains the longest
	// prefix which is also suffix in
	// "pat[0..state-1]c"

	// Start from the largest possible
	// value and stop when you find a
	// prefix which is also suffix
	for (ns = state; ns > 0; ns--)
	{
		if (pat[ns - 1] == (char)x)
		{
			for (i = 0; i < ns - 1; i++)
			{
				if (pat[i] != pat[state - ns + 1 + i])
				{
					break;
				}
			}
				if (i == ns - 1)
				{
					return ns;
				}
		}
	}

		return 0;
}

/* This function builds the TF table which
represents Finite Automata for a given pattern */
public static void computeTF(char[] pat,
							int M, int[][] TF)
{
	int state, x;
	for (state = 0; state <= M; ++state)
	{
		for (x = 0; x < NO_OF_CHARS; ++x)
		{
			TF[state][x] = getNextState(pat, M,
										state, x);
		}
	}
}

/* Prints all occurrences of
pat in txt */
public static void search(char[] pat,
						char[] txt)
{
	int M = pat.Length;
	int N = txt.Length;


	int[][] TF = RectangularArrays.ReturnRectangularIntArray(M + 1,
													NO_OF_CHARS);

	computeTF(pat, M, TF);

	// Process txt over FA.
	int i, state = 0;
	for (i = 0; i < N; i++)
	{
		state = TF[state][txt[i]];
		if (state == M)
		{
			Console.WriteLine("Pattern found " +
							"at index " + (i - M + 1));
		}
	}
}

public static class RectangularArrays
{
public static int[][] ReturnRectangularIntArray(int size1,
												int size2)
{
	int[][] newArray = new int[size1][];
	for (int array1 = 0; array1 < size1; array1++)
	{
		newArray[array1] = new int[size2];
	}

	return newArray;
}
}


// Driver code
public static void Main(string[] args)
{
	char[] pat = "AABAACAADAABAAABAA".ToCharArray();
	char[] txt = "AABA".ToCharArray();
	search(txt,pat);
}
}

// This code is contributed by Shrikant13
