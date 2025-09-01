import React from "react";

import Pokemon from "./Pokemon.jsx";
import Load from "./Load.jsx";
import closeX from "../assets/close-x.svg"

function EvolutionChain({ setIsShowingEvolutionChain, showEvolutionChain, setShowEvolutionChain, pokemonInfo }) {
    const [isClosing, setIsClosing] = React.useState(false);

    return (
        <div
            className={`w-full h-full flex justify-center pt-8 p-4 overflow-y-auto overflow-x-hidden fixed overscroll-none z-10 inset-0 bg-black/80
                    ${isClosing ? 'animate-mpm-fade-out' : 'animate-mpm-fade-in'}`}
            onAnimationEnd={() => {
                if (isClosing) {
                    setIsClosing(false);
                    setIsShowingEvolutionChain(false);
                    setShowEvolutionChain([]);
                }
            }}
        >
            <div className={`my-auto flex flex-wrap justify-center gap-x-8 gap-y-14`}> {
                showEvolutionChain.length === 0
                    ? <Load />
                    : (
                        showEvolutionChain.map((path, idx) => {
                            return (
                                <div className={`h-max shrink-0 flex flex-col xl:flex-row justify-center gap-6 bg-slate-300/60 py-8 px-6 rounded-xl overflow-y-visible`} key={'mpm-'+idx}>{
                                    path.map((stage) => {
                                        const pokemonData = pokemonInfo[stage.name];
                                        return <Pokemon key={'mpm-'+pokemonData.name} pokemon={pokemonData} />
                                    })
                                }</div>
                            )
                        })
                    )
            } </div>
            <button
                className={`w-12 h-12 rounded-full fixed right-6 top-6 bg-black/60 text-white text-xl p-2 cursor-pointer`}
                onClick={() => {
                    setIsClosing(true);
                }}
            >
                <img src={closeX} alt={`\u26CC`} />
            </button>
        </div>
    );
}

export default EvolutionChain;