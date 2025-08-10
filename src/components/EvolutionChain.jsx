import React from "react";

import Pokemon from "./Pokemon.jsx";

function EvolutionChain({ evolutionChain }) {
    return (
        evolutionChain.map((path) => {
            path.map((pokemon) => {
                return <div key={pokemon.id}>{pokemon.name}</div>
            })
        })
    );
}

export default EvolutionChain;