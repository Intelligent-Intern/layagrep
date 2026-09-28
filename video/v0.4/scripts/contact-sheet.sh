#!/bin/bash
# usage: scripts/contact-sheet.sh video name t1 t2 ...  -> out/sheet_name.png (3x2 tiles)
v=$1; name=$2; shift 2; i=0
mkdir -p out/f
rm -f out/f/${name}_*.png
for ts in "$@"; do
  ffmpeg -loglevel error -y -ss $ts -i $v -frames:v 1 -vf "scale=960:-1" out/f/${name}_$(printf %02d $i).png
  i=$((i+1))
done
ffmpeg -loglevel error -y -pattern_type glob -i "out/f/${name}_*.png" -vf tile=3x2 out/sheet_$name.png
