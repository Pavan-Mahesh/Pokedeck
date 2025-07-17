import React from "react"

import Load from "./Load.jsx"
import Pokemon from "./Pokemon.jsx";

const POKEDEX_URL = 'https://pokeapi.co/api/v2/pokedex/1';
const LIMIT = 16;

function PokemonGrid () {
    const [pokemonList, setPokemonList] = React.useState([]);
    const [pokemonInfo, setPokemonInfo] = React.useState([]);

    const evolutionList = React.useRef({});

    const [count, setCount] = React.useState(0);

    const [isLoading, setIsLoading] = React.useState(false);
    const didInitialLoad = React.useRef(false);

    React.useEffect(() => {
        if (didInitialLoad.current) return;

        setIsLoading(true)
        const controller = new AbortController();

        fetch(POKEDEX_URL, { signal: controller.signal })
            .then(res => {
                if(!res.ok) {
                    throw new Error("Failed to fetch pokemon list");
                }

                return res.json()
            })
            .then(data => {
                const list = data.pokemon_entries.map((entry) => {
                    return {
                        name: entry.pokemon_species.name,
                        url: entry.pokemon_species.url,
                    }
                })
                setPokemonList(list);
            })
            .catch((err) => {
                console.log(err.name + ": " + err.message)
            })
            .finally(() => {
                setIsLoading(false);
            })

        return (() => {
            controller.abort();
        })
    }, []);

    React.useEffect(() => {
        if(pokemonList.length > 0 && !didInitialLoad.current) {
            loadMorePokemon().then(() => {
                didInitialLoad.current = true;
            })
        }
    }, [pokemonList]);

    async function loadMorePokemon() {
        setIsLoading(true)

        try {
            const newInfo = await Promise.all(
                pokemonList.slice(count, count + LIMIT).map((pokemon) => (
                    getPokemonInfo(pokemon.url)
                        .catch((err) => {
                            console.log(err.name + ": " + err.message)
                            return null;
                        })
                ))
            );

            await delay()

            // filtering nulls
            // const filteredNewInfo = newInfo.filter(Boolean);

            setPokemonInfo((prev) => [...prev, ...newInfo]);
            setCount((prev) => prev + LIMIT);
        } catch (err) {
            console.log(err.name + ": " + err.message);
        } finally {
            setIsLoading(false);
        }
    }

    async function getPokemonInfo(url) {
        const speciesRes = await fetch(url);

        if(!speciesRes.ok) {
            throw new Error("Failed to fetch pokemon info.");
        }
        const speciesData = await speciesRes.json();

        const pokemonInfo = {}
        pokemonInfo.id = speciesData.id;
        pokemonInfo.name = speciesData.name;
        pokemonInfo.flavorText = speciesData.flavor_text_entries.find((entry) => {
            return entry.flavor_text.length <= 200 && entry.language.name === "en"
        }).flavor_text.replaceAll("\f", " ");
        pokemonInfo.evolvesFrom = speciesData.evolvesFrom;
        pokemonInfo.evolutionChainURL = speciesData.evolution_chain.url;
        pokemonInfo.pokemonURL = speciesData.varieties.find((variety) => {
            return variety.is_default
        }).pokemon.url;

        const [pokemonRes, evolutionChainRes] = await Promise.all([
            fetch(pokemonInfo.pokemonURL),
            fetch(pokemonInfo.evolutionChainURL)
        ])

        if(!pokemonRes.ok ||  !evolutionChainRes.ok) {
            throw new Error("Failed to fetch pokemon info.");
        }
        const [pokemonData, evolutionChainData] = await Promise.all([
            pokemonRes.json(),
            evolutionChainRes.json()
        ])

        // converting height form decimeter to meters and inches
        const totalInches = pokemonData.height * 10 / 2.54;
        let feet = Math.floor(totalInches / 12);
        let inches = Math.round(totalInches % 12);
        if (inches === 12) {
            inches = 0;
            feet++;
        }

        // converting weight from hectograms to kg and pounds
        const lbs = (pokemonData.weight * 0.22046).toFixed(1);

        pokemonInfo.height = `${pokemonData.height / 10} m (${feet}'${inches.toString().padStart(2, "0")}")`;
        pokemonInfo.weight = `${pokemonData.weight / 10} kgs (${lbs} lbs)`;
        pokemonInfo.types = pokemonData.types.map((slot) => {
            return slot.type.name;
        })
        pokemonInfo.stats = pokemonData.stats.map((statItem) => {
            return {
                name: statItem.stat.name.split("-").map((word) => {
                    if (word === "hp") return "HP"
                    if (word === "special") return "Spl."
                    return word.charAt(0).toUpperCase() + word.slice(1);
                }).join(" "),
                base_stat: statItem.base_stat,
            }
        })

        // getting evolution data
        const evolutionChainId = pokemonInfo.evolutionChainURL.match(/\/evolution-chain\/(\d+)\//)[1];

        if(!evolutionList.current[evolutionChainId])
            evolutionList.current[evolutionChainId] = getEvolutions(evolutionChainData.chain);

        pokemonInfo.evolutionChain = evolutionList.current[evolutionChainId];

        return pokemonInfo;

        // Recursive DFS to collect all possible evolution chains as arrays of IDs
        function getEvolutions(chain) {
            const results = [];
            traverse(chain, []);
            return results;

            function traverse(node, path) {
                // Add current Pokémon to the chain
                const newPath = [...path, {
                    name: node.species.name,
                    id: getIdFromUrl(node.species.url),
                }];

                // If no further evolutions, this is a completed path
                if(node.evolves_to.length === 0) {
                    results.push(newPath);
                } else {
                    // Continue recursion through each branch
                    node.evolves_to.map((evo) => traverse(evo, newPath))
                }
            }

            function getIdFromUrl(url) {
                const matchId = url.match(/\/pokemon-species\/(\d+)\//)
                // matchId => ["/pokemon-species/1/", "1"]
                return parseInt(matchId[1], 10);
            }
        }

    }

    function delay() {
        return new Promise(resolve => setTimeout(resolve, 600));
    }

    return (
        <div className="
             w-full h-screen px-6 py-10 grid grid-cols-[repeat(auto-fit,21rem)] auto-rows-max justify-center gap-8 overflow-y-scroll overflow-x-hidden
        ">
            {
                pokemonInfo.map(pokemon => {
                    return <Pokemon key={pokemon.id} pokemon={pokemon} />
                })
            }

            {
                isLoading && [...Array(LIMIT)].map((_, idx) =>
                    <div key={idx} className={`w-[21rem] aspect-[9/16] bg-white rounded-xl shadow-md animate-pulse`}>{idx}</div>
                )
            }

            <div className={`w-full col-start-1 -col-end-1`}>
                {
                    count < 1025
                        ?   <button
                                className={`
                                    m-auto w-64 h-14 flex justify-center items-center rounded-md bg-[#f49545] text-white text-xl font-semibold ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
                                `}
                                disabled={isLoading}
                                onClick={loadMorePokemon}
                            >{isLoading ? <Load sideText={true} /> : 'Load more Pokemon'}</button>
                        :   <h1 className={`text-center text-2xl font-bold font-ranchers`}>You have reached the end of the deck...</h1>
                }
            </div>
        </div>
    )
}

export default PokemonGrid;