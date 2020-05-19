const fs = require("fs");
const path = require("path");
const babylon = require("babylon");
const traverse = require("babel-traverse").default;
const { transformFromAst } = require("babel-core");

let globalCounter = 0;
const customLoaders = [(filename, code) => code];

function createAsset(filename) {
  // 记录资源ID
  const id = globalCounter++;
  // 同步读取文件
  const content = fs.readFileSync(filename, "utf-8");
  // 生成抽象语法树
  const ast = babylon.parse(content, {
    sourceType: "module",
  });
  // 遍历抽象语法树，收集依赖
  const dependencies = [];
  traverse(ast, {
    ImportDeclaration: ({ node }) => {
      dependencies.push(node.source.value);
    },
  });
  // 根据抽象语法树转换代码
  let { code } = transformFromAst(ast, null, {
    presets: ["env"],
  });
  // 调用loader转换代码
  for (const loader of customLoaders) {
    code = loader(filename, code);
  }
  return {
    id,
    filename,
    dependencies,
    code,
  };
}

function createGraph(entry) {
  const mainAsset = createAsset(entry);
  const queue = [mainAsset];
  for (const asset of queue) {
    asset.mapping = {};
    const dirname = path.dirname(asset.filename);
    asset.dependencies.forEach((relativePath) => {
      const absolutePath = path.join(dirname, relativePath);

      let child;
      for (const asset2 of queue) {
        if (absolutePath === asset2.filename) {
          child = asset2;
          break;
        }
      }

      if (!child) {
        child = createAsset(absolutePath);
        queue.push(child);
      }

      asset.mapping[relativePath] = child.id;
    });
  }
  return queue;
}

const graph = createGraph("src/index.js");
// console.log(graph);

function bundle(graph) {
  let modules = "";
  graph.forEach((m) => {
    modules += `${m.id}:[
      function (require, module, exports) {
        ${m.code}
      },
      ${JSON.stringify(m.mapping)},
    ],`;
  });
  const result = `
    (function(modules) {
      function require(id) {
        const [fn, mapping] = modules[id];

        function localRequire(name) {
          return require(mapping[name]);
        }

        const module = { exports : {} };

        fn(localRequire, module, module.exports);

        return module.exports;
      }

      require(0);
    })({${modules}})
  `;
  return result;
}

const result = bundle(graph);
// console.log(result);

const outputDir = "./dist";
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

fs.writeFileSync(path.join(outputDir, "index.js"), result);
