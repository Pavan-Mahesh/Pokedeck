import React from "react"

import Load from "./Load.jsx"
import Pokemon from "./Pokemon.jsx";
import FloatPokemon from "./FloatPokemon.jsx";

const SPECIES_URL = 'https://pokeapi.co/api/v2/pokemon-species/?offset=0&limit=1025';
const LIMIT = 20;

function PokemonGrid () {
    const [pokemonList, setPokemonList] = React.useState([]);
    const [count, setCount] = React.useState(LIMIT);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    const [selected, setSelected] = React.useState(null);
    const [animateBack, setAnimateBack] = React.useState(false);

    React.useEffect(() => {
        setIsLoading(true);

        fetch(SPECIES_URL)
            .then(res => {
                if(!res.ok) throw new Error("Failed to fetch pokemon list");
                return res.json()
            })
            .then((data) => {
                setTimeout(() => {
                    setPokemonList(
                        data.results.map((pokemon) => {
                            const matchID = pokemon.url.match(/\/pokemon-species\/(\d+)\//);
                            // matchID => ["/pokemon-species/1/", "1"]
                            const id = parseInt(matchID[1], 10);
                            return {name: pokemon.name, id};
                        })
                    );

                    setIsLoading(false);
                }, 300)
            })
            .catch((err) => {
                console.error('Error:', err.message)
                setError('Error: ' + 'Failed to fetch pokemon list');
                setIsLoading(false);
            })
    }, []);

    async function loadMorePokemon() {
        setIsLoading(true);
        setTimeout(() => {
            setCount(prev => prev + LIMIT);
            setIsLoading(false);
        }, 300)
    }

    return (
        <div className="
             w-full h-screen px-6 py-10 grid grid-cols-[repeat(auto-fit,16rem)] auto-rows-max justify-center gap-8 overflow-y-scroll overflow-x-hidden
        ">
            {
                pokemonList.slice(0, count).map((pokemon) => {
                    return (
                        <Pokemon
                            key={pokemon.id}
                            pokemon={pokemon}
                            isSelected={selected?.id === pokemon.id}
                            setSelected={setSelected}
                            animateBack={animateBack}
                        />
                    )
                })
            }

            <button
                className={`
                    w-64 h-14 col-start-1 -col-end-1 place-self-center flex justify-center items-center rounded-md bg-[#f49545] text-white text-xl font-semibold ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
                disabled={isLoading}
                onClick={loadMorePokemon}
            >{isLoading ? <Load sideText={true} /> : 'Load more Pokemon'}</button>

            { selected && (
                <FloatPokemon
                    selected={selected}
                    setSelected={setSelected}
                    animateBack={animateBack}
                    setAnimateBack={setAnimateBack}
                /> )
            }
        </div>
    )
}

export default PokemonGrid;