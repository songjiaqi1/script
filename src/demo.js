const table = base.getTableByName('插件测试');
console.log(table);
const row = table.rows[0];
console.log(row._id);
output.markdown(`#### ${row._id}`)

const text = await input.inputTextAsync('wewewe')

utils.deleteRowById(table, row._id);
const a = () => {
  console.log('ccc');
}

await a();