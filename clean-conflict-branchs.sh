git branch -l | grep -w conflict >> branchs.txt

while read -r branch; do
	git branch -d  $branch
done < branchs.txt

rm branchs.txt
