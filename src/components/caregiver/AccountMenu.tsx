19:49:39 [vite] Internal server error: /home/project/src/components/layout/Header.tsx: Unexpected token, expected "," (44:12)

  42 |   return (
  43 |     {/* lighter + subtle blur; keep border for separation */}
> 44 |     <header className="bg-warm-white/95 backdrop-blur supports-[backdrop-filter]:bg-warm-white/80 border-b border-slate-gray/20">
     |             ^
  45 |       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  46 |         <div className="flex justify-between items-center h-16">
  47 |           <Link to="/" aria-label="CarerView home" className="flex items-center">
  Plugin: vite:react-babel
  File: /home/project/src/components/layout/Header.tsx:44:12
  42 |    return (
  43 |      {/* lighter + subtle blur; keep border for separation */}
  44 |      <header className="bg-warm-white/95 backdrop-blur supports-[backdrop-filter]:bg-warm-white/80 border-b border-slate-gray/20">
     |              ^
  45 |        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  46 |          <div className="flex justify-between items-center h-16">
      at constructor (file:///home/project/node_modules/@babel/parser/lib/index.js#cjs:362:19)
      at TypeScriptParserMixin.raise (file:///home/project/node_modules/@babel/parser/lib/index.js#cjs:3259:19)
      at TypeScriptParserMixin.unexpected (file:///home/project/node_modules/@babel/parser/lib/index.js#cjs:3279:16)
      at TypeScriptParserMixin.expect (file:///home/project/node_modules/@babel/parser/lib/index.js#cjs:3589:12)
      at TypeScriptParserMixin.parseParenAndDistinguishExpression (file:///home/project/node_modules/@babel/parser/lib/index.js#cjs:11182:14)
      at TypeScriptParserMixin.parseExprAtom (file:///home/project/node_modules/@babel/parser/lib/index.js#cjs:10849:23)
      at TypeScriptParserMixin.parseExprAtom (file:///home/project/node_modules/@babel/parser/lib/index.js#cjs:6811:20)
      at TypeScriptParserMixin.parseExprSubscripts (file:///home/project/node_modules/@babel/parser/lib/index.js#cjs:10591:23)
      at TypeScriptParserMixin.parseUpdate (file:///home/project/node_modules/@babel/parser/lib/index.js#cjs:10576:21)
      at TypeScriptParserMixin.parseMaybeUnary (file:///home/project/node_modules/@babel/parser/lib/index.js#cjs:10556:23)