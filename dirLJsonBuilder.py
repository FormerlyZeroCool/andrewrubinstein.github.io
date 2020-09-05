import os
import sys
filepath = ''
if(len(sys.argv)>1):
    filepath = sys.argv[1]
else:
    filepath = "blogposts"
arr = os.listdir(filepath)
dataArr = []
class Object(object):
    pass
for x in arr:
    file = open(filepath+os.path.sep+x,'r')
    data = file.read()
    if data.find('<desc hidden>') != -1:
        p = Object()
        p.title = (data[data.find('<title>')+7:data.find('</title>')]).replace('\n','')
        p.desc = (data[data.find('<desc hidden>')+13:data.find('</desc>')]).replace('\n','')
        p.name = x
        dataArr.append(p)
json = ''
for x in dataArr:
    json += '{"fileName":"' + x.name + '","title":"' + x.title + '","desc":"' + x.desc + '"},\n'
json = json[0:len(json)-2]
json = '['+json+']'
print('Data saved:')
print(json)

newFileName = filepath+'_index.json'
print('New file name:',newFileName)
file = open(newFileName,'w')
file.write(json)
file.close