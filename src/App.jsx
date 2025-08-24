import React from "react";

import PokemonGrid from './components/PokemonGrid.jsx'

function App() {
    return (
        <main className="w-full h-lvh bg-slate-100 font-cursive font-semibold overflow-y-scroll overflow-x-hidden overscroll-none">
            <PokemonGrid />
        </main>
    )
}

export default App;