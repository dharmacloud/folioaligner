export const sutras=[
    {no:'541',title:'長阿含經',youtube:'9U9ddWjH2AQ',juanpage:[74,45,58,55,50,50,39,48,40,68,55,71,54,48,60,48,60,62,63,68,58,49]},
    {no:'538',title:'中阿含經',youtube:'DzgdZCfG5Mo',juanpage:[50,50,63,66,50,55,69,65,63,62,50,60,45,57,53,63,57,62,64,48,45,46,54,53,46,54,47,40,57,63,42,39,74,47,47,56,51,53,48,46,43,52,58,43,39,39,52,27,70,49,52,53,35,56,47,49,53,38,67,70]},
    {no:'540',title:'雜阿含經',youtube:'XTHD0CF-aRI',juanpage:[54,64,59,54,65,42,55,57,67,66,55,64,54,61,64,62,70,59,54,55,57,61,74,54,36,73,61,60,60,53,57,62,67,72,72,61,77,56,58,54,54,51,58,62,58,52,68,62,59,73]},
    {no:'539',title:'增一阿含經',youtube:'srcQt__mtDI',juanpage:[43,26,41,34,41,40,47,46,49,31,42,59,50,41,52,35,37,48,46,61,34,53,69,65,66,73,34,49,34,40,45,46,57,50,45,38,36,37,35,22,51,43,42,65,54,48,65,60,35,41,43,26,41,34,41,40,47,46,49,31,42,59,50,41,52,35,37,48,46,61,34,53,69,65,66,73,34,49,34,40,45,46,57,50,45,38,36,37,35,22,51,43,42,65,54,48,65,60,35,41]}
]

export const findSutra=(no)=>{
    for (let i=0;i<sutras.length;i++) {
        if (sutras[i].no==no) {
            return sutras[i]
        }
    }
}