import os
import sys
filepath = ''
if(len(sys.argv)>1):
    filepath = sys.argv[1]
else:
    filepath = "blogposts"
arr = os.listdir(filepath)
json = ''
for x in arr:
    json += '{"fileName":"' + x + '"},'
json = json[0:len(json)-1]
json = '['+json+']'
print('Data saved:')
print(json)

newFileName = filepath+'_index.json'
print('New file name:',newFileName)
file = open(newFileName,'w')
file.write(json)
file.close