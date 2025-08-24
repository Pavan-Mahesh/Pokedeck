import React from "react";

import Pokemon from "./Pokemon.jsx";
import closeX from "../assets/close-x.svg"

function EvolutionChain({ showEvolutionChain, setShowEvolutionChain, pokemonInfo }) {
    const [isClosing, setIsClosing] = React.useState(false);

    return (
        <div
            className={`w-full h-lvh flex justify-center pt-8 p-4 overflow-y-auto overflow-x-hidden absolute z-10 inset-0 bg-black/80
                    ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
            onAnimationEnd={() => {
                if (isClosing) {
                    setIsClosing(false);
                    setShowEvolutionChain([]);
                }
            }}
        >
            <div className={`my-auto flex flex-wrap justify-center gap-x-8 gap-y-14`}> {
                showEvolutionChain.map((path, idx) => {
                    return (
                        <div className={`h-max shrink-0 flex flex-col xl:flex-row justify-center gap-6 bg-slate-300/60 py-8 px-6 rounded-xl overflow-y-visible`} key={idx}>{
                            path.map((stage) => {
                                const pokemonData = pokemonInfo[stage.name];
                                return <Pokemon key={pokemonData.name} pokemon={pokemonData} />
                            })
                        }</div>
                    )
                })
            } </div>
            <button
                className={`w-12 h-12 rounded-full fixed right-6 top-6 bg-black/60 p-2 cursor-pointer`}
                onClick={() => {
                    setIsClosing(true);
                }}
            >
                <img src={closeX} alt="X" />
            </button>
        </div>
    );
}

export default EvolutionChain;