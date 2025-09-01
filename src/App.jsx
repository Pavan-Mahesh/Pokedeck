import React from "react";

import PokemonGrid from './components/PokemonGrid.jsx'

function App() {
    const mainElem = React.useRef(null);

    return (
        <main ref={mainElem} className="w-screen h-lvh flex flex-col font-mpm-cursive font-semibold overflow-y-scroll overflow-x-hidden">
            <PokemonGrid mainElem={mainElem} />
        </main>
    )
}

export default App;