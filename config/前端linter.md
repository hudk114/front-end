# 前端linter简要总结
总结下项目中用到的前端的linter，主要是eslint+prettier+stylelint

本文目前只说明配置及几种常用插件的应用场景及自己用到的[基本配置文件](https://github.com/hudk114/code-helper/tree/master/front-end/linter-format)

原理后续看了源码再补充

## eslint
eslint针对的是js的一些代码风格的规范化，并且通过一系列规范降低代码可能的错误。

eslint的原理是采用AST，可以通过配置文件方便的扩展自定义规则。

基础配置可以直接参考[官方文档](https://eslint.org/docs/user-guide/getting-started)，支持配置文件与CLI，另外还有[eslint-loader](https://www.npmjs.com/package/eslint-loader)，可以用于webpack打包开发

常见的配置有 airbnb的[eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb), google的[eslint-config-google](https://www.npmjs.com/package/eslint-config-google) 以及 [eslint-config-standard](eslint-config-standard)，选择一种在上面修改即可，通过extends导入即可

此外，配置文件中有几个比较重要常用的项
1. Environments
  代码的预期执行环境，eslint会预设针对的全局变量
1. Globals
  手动添加的全局变量，如果不添加在代码中会报`no-undef`错误
1. Rules
  手动覆盖的规则
1. parser
  指定使用的AST分析器
1. parserOptions
  手动指定代码针对的环境与AST分析选项，可以选择使用es6、jsx等等
1. plugins
  plugins内部都是导出了规则的npm包，[其中可以配置或者关闭原有的规则](https://eslint.org/docs/3.0.0/developer-guide/working-with-plugins#create-a-plugin)

配置文件可以指定使用与不使用eslint的文件，此外，代码中还有写地方需要手动忽略eslint，例如`new Vue({})`会触发`no-new`错误，这时可以采用以下几种方式
``` javascript
/* eslint-disable */
/* eslint-disable no-alert */
// eslint-disable-line
// eslint-disable-next-line
// eslint-disable-line no-alert
// eslint-disable-next-line no-alert
```
可以不判断指定的语句或不判断指定语句的指定错误

## prettier
与eslint不同，[prettier](https://github.com/prettier/prettier)针对的主要是代码格式，主要用于团队中代码格式的统一

prettier目前[可配置的功能](https://prettier.io/docs/en/options.html)较少，且部分会与eslint的一些规则冲突，因此有一些库来整合两者

### [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier)
这个库的主要作用是将prettier规则作为eslint规则的一部分，对比prettier格式化前后的代码，有不一致就报错。因此最终检查还是采用eslint，所以建议将eslint中与format有关的规则全部去掉，采用prettier来检查。不然会互相矛盾的报错

### [prettier-eslint](https://github.com/prettier/prettier-eslint) + [prettier-eslint-cli](https://github.com/prettier/prettier-eslint-cli)
与`eslint-plugin-prettier`不同，`prettier-eslint`采用的是先prettier格式化再跑一边`eslint --fix`的方式，因此最后的结果肯定是支持eslint的，prettier只起到一个预格式化的作用，冲突部分根据eslint为准

_因为有一个eslint的配置项prettier不支持，所以个人项目中采用的是`prettier-eslint`_

## stylelint
eslint与prettier针对的都是js代码，而stylelint则针对的是css文件。

配置和eslint类似，但是感觉没eslint做得好... [官网](https://stylelint.io/)

# 参考
1. [Eslint 背后那些我们应该知道的为什么](https://juejin.im/entry/589d7038128fe100580e3e26)
2. [用 ESLint 和 Prettier 写出高质量代码](https://egoist.moe/2017/12/11/write-better-code-with-eslint-and-prettier/)