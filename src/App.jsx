import React from "react";

import PokemonGrid from './components/PokemonGrid.jsx'

function App() {
    const mainElem = React.useRef(null);

    return (
        <main ref={mainElem} className="w-screen h-svh flex flex-col bg-slate-100 font-mpm-cursive font-semibold overflow-y-scroll overflow-x-hidden overscroll-none">
            <PokemonGrid mainElem={mainElem} />
        </main>
    )
}

export default App;