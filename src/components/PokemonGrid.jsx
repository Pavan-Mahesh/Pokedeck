import React from "react";

import Load from "./Load.jsx";
import Pokemon from "./Pokemon.jsx";
import EvolutionChain from "./EvolutionChain.jsx";
import Footer from "./Footer.jsx";

import pokeDeck from "../assets/pokedeck.png";
import upArrow from "../assets/up-arrow.svg";

const POKEDEX_URL = 'https://pokeapi.co/api/v2/pokedex/1';
const TYPE_URL = 'https://pokeapi.co/api/v2/type/';
const GEN_URL = 'https://pokeapi.co/api/v2/generation/';
const LIMIT = 12;

const TYPES = [
    "normal", "fighting", "flying", "poison", "ground", "rock", "bug", "ghost",
    "steel", "fire", "water", "grass", "electric", "psychic", "ice", "dragon", "dark", "fairy"
];

function PokemonGrid({ mainElem }) {
    // states
    const [allPokemon, setAllPokemon] = React.useState([]);
    const [genList, setGenList] = React.useState([]);
    const [typeList, setTypeList] = React.useState([]);
    const [displayList, setDisplayList] = React.useState([]);
    const [pokemonInfo, setPokemonInfo] = React.useState({});

    // ui
    const [searchText, setSearchText] = React.useState("");
    const [currGen, setCurrGen] = React.useState("all");
    const [currType, setCurrType] = React.useState("all");
    const [showEvolutionChain, setShowEvolutionChain] = React.useState([]);
    const [isScrolled, setIsScrolled] = React.useState(false);

    // booleans
    const [isLoading, setIsLoading] = React.useState(false);
    const [isShowingEvolutionChain, setIsShowingEvolutionChain] = React.useState(false);
    const [isInitialLoad, setIsInitialLoad] = React.useState(true);
    const [errorMsg, setErrorMsg] = React.useState("");

    // pagination
    const [visibleCount, setVisibleCount] = React.useState(LIMIT);

    // refs
    const headerElem = React.useRef(null);

    // initial load
    React.useEffect(() => {
        const onScroll = () => {
            if (headerElem.current) {
                setIsScrolled(headerElem.current.getBoundingClientRect().top !== 0);
            }
        };

        mainElem.current.addEventListener('scroll', onScroll);

        loadInitialPokemon();

        return () => {
            mainElem.current.removeEventListener('scroll', onScroll);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function loadInitialPokemon() {
        try {
            setIsLoading(true);
            const response = await fetch(POKEDEX_URL);
            if (!response.ok) throw new Error("Failed to fetch pokemon list");

            const data = await response.json();
            const pokemonList = data.pokemon_entries
                .map(entry => {
                    const match = entry.pokemon_species.url.match(/\/pokemon-species\/(\d+)\//);
                    const id = match ? parseInt(match[1], 10) : null;
                    return id && id <= 1025 ? {
                        name: entry.pokemon_species.name,
                        id: id
                    } : null;
                })
                .filter(Boolean);

            setAllPokemon(pokemonList);
            setGenList(pokemonList);
            setTypeList(pokemonList);
            setDisplayList(pokemonList);

            await loadPokemonDetails(pokemonList.slice(0, LIMIT));

        } catch (error) {
            console.error("Initial load error:", error);
            setErrorMsg("Failed to load Pokédex. Please refresh the page.");
        } finally {
            setIsLoading(false);
            setIsInitialLoad(false);
        }
    }

    // generation filter
    React.useEffect(() => {
        if (isInitialLoad) return;
        loadGenerationFilter();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currGen]);

    async function loadGenerationFilter() {
        try {
            setIsLoading(true);
            setGenList([]);

            let newGenList = allPokemon;
            if (currGen !== "all") {
                const response = await fetch(GEN_URL + currGen);
                if (!response.ok) throw new Error("Failed to fetch generation pokemon's data");

                const data = await response.json();

                newGenList = data["pokemon_species"]
                    .map(entry => {
                        const match = entry.url.match(/\/pokemon-species\/(\d+)\//);
                        const id = match ? parseInt(match[1], 10) : null;
                        return id ? {
                            name: entry.name,
                            id: id
                        } : null;
                    })
                    .filter(Boolean);
            }

            setGenList(newGenList);
            setVisibleCount(LIMIT);
            setErrorMsg("");

        } catch (error) {
            console.error("Generation filter error:", error);
            setErrorMsg("Failed to load that generation. Try again.");
        } finally {
            setIsLoading(false);
        }
    }

    // type filter
    React.useEffect(() => {
        if (isInitialLoad) return;
        loadTypeFilter();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currType, genList]);

    async function loadTypeFilter(baseList) {
        try {
            setIsLoading(true);
            setTypeList([]);
            setDisplayList([]);
            setVisibleCount(LIMIT);

            // baseList allows immediate use when caller already has the new generation list
            const currentGenList = baseList ?? genList ?? [];

            let newTypeList = [];

            if (currType !== "all") {
                const response = await fetch(TYPE_URL + currType);
                if (!response.ok) throw new Error("Failed to fetch type data");

                const data = await response.json();
                newTypeList = data.pokemon
                    .map(entry => {
                        const match = entry.pokemon.url.match(/\/pokemon\/(\d+)\//);
                        const id = match ? parseInt(match[1], 10) : null;
                        return id && id <= 1025 ? {
                            name: entry.pokemon.name,
                            id: id
                        } : null;
                    })
                    .filter(Boolean);

                // INTERSECTION: if generation is restricted, intersect type results with the generation list
                if (currentGenList && currentGenList.length > 0) {
                    const genIdSet = new Set(currentGenList.map(p => p.id));
                    newTypeList = newTypeList.filter(p => genIdSet.has(p.id));
                }
            } else {
                // currType === "all" -> result should reflect the current generation list
                newTypeList = currentGenList;
            }

            const filtered = applySearch(newTypeList, searchText || "");
            setTypeList(newTypeList);
            setDisplayList(filtered);

            await loadPokemonDetails(filtered.slice(0, LIMIT));

        } catch (error) {
            console.error("Type filter error:", error);
            setErrorMsg("Failed to load that type. Try again.");
        } finally {
            setIsLoading(false);
        }
    }

    // quick search
    function applySearch(list, query) {
        if (!query || !query.trim()) return list;

        const cleaned = query.trim().toLowerCase();
        const searchNumber = Number(cleaned);
        return list.filter(pokemon =>
            pokemon.name.toLowerCase().includes(cleaned.replaceAll(" ", "")) ||
            (!Number.isNaN(searchNumber) && pokemon.id === searchNumber)
        );
    }

    function handleSearch(value) {
        setSearchText(value);

        const baseList = currType === "all" ? genList : typeList;
        const filtered = applySearch(baseList, value);

        setDisplayList(filtered);
        setVisibleCount(LIMIT);

        const visible = filtered.slice(0, LIMIT);
        const needsLoading = visible.filter(p => !pokemonInfo[p.name]);
        if (needsLoading.length > 0) {
            loadPokemonDetails(needsLoading);
        }
    }

    // load more
    async function loadMore() {
        const nextBatch = displayList.slice(visibleCount, visibleCount + LIMIT);
        await loadPokemonDetails(nextBatch);
        setVisibleCount(prev => prev + LIMIT);
    }

    // setting Pokémon info
    async function loadPokemonDetails(pokemonList) {
        if (!pokemonList || pokemonList.length === 0) return;
        setIsLoading(true);

        try {
            const promises = pokemonList.map(async (pokemon) => {
                try {
                    const details = await fetchPokemonDetails(pokemon.id);
                    return { [pokemon.name]: details };
                } catch (error) {
                    console.error(`Failed to load ${pokemon.name}:`, error);
                    return null;
                }
            });

            const results = await Promise.all(promises);
            const newInfo = results.filter(Boolean).reduce((acc, curr) => ({ ...acc, ...curr }), {});

            setPokemonInfo(prev => ({ ...prev, ...newInfo }));
        } catch (error) {
            console.error("Batch loading error:", error);
            setErrorMsg("Failed to load some Pokémon details.");
        } finally {
            setIsLoading(false);
        }
    }

    // get Pokémon   details
    async function fetchPokemonDetails(pokemonIdOrName) {
        const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemonIdOrName}`;
        const speciesResponse = await fetch(speciesUrl);
        if (!speciesResponse.ok) throw new Error("Species fetch failed");

        const speciesData = await speciesResponse.json();

        const pokemonUrl = speciesData.varieties?.find(v => v.is_default)?.pokemon?.url;
        if (!pokemonUrl) throw new Error("No default pokemon variant");

        const pokemonResponse = await fetch(pokemonUrl);
        if (!pokemonResponse.ok) throw new Error("Pokemon fetch failed");

        const pokemonData = await pokemonResponse.json();

        const flavorEntry = speciesData.flavor_text_entries?.find(entry =>
            entry.language.name === "en" && entry.flavor_text.length <= 200
        );

        const heightM = pokemonData.height / 10;
        const weightKg = pokemonData.weight / 10;
        const totalInches = heightM * 39.37;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        const lbs = (weightKg * 2.20462).toFixed(1);

        const stats = pokemonData.stats.map(stat => ({
            name: stat.stat.name.split("-").map(word => {
                if (word === "hp") return "HP";
                if (word === "special") return "Spl.";
                return word.charAt(0).toUpperCase() + word.slice(1);
            }).join(" "),
            base_stat: stat.base_stat
        }));

        let evolutionChain = [];
        if (speciesData.evolution_chain?.url) {
            try {
                const evoResponse = await fetch(speciesData.evolution_chain.url);
                if (evoResponse.ok) {
                    const evoData = await evoResponse.json();
                    evolutionChain = parseEvolutionChain(evoData.chain);
                }
            } catch (error) {
                console.error("Evolution chain error:", error);
            }
        }

        return {
            id: speciesData.id,
            name: speciesData.name,
            flavorText: flavorEntry ? flavorEntry.flavor_text.replace(/\f/g, " ") : "",
            height: `${heightM} m (${feet}'${inches.toString().padStart(2, "0")}")`,
            weight: `${weightKg} kg (${lbs} lbs)`,
            types: pokemonData.types.map(type => type.type.name),
            stats: stats,
            evolutionChain: evolutionChain
        };
    }

    // get evolution data
    function parseEvolutionChain(chain) {
        const paths = [];

        function traverse(node, currentPath = []) {
            const newPath = [...currentPath, {
                name: node.species.name,
                id: parseInt(node.species.url.match(/\/(\d+)\/$/)[1])
            }];

            if (!node.evolves_to || node.evolves_to.length === 0) {
                paths.push(newPath);
            } else {
                node.evolves_to.forEach(evolution => traverse(evolution, newPath));
            }
        }

        traverse(chain);
        return paths;
    }

    // show evolution data
    async function openEvolutionChain(evolutionChain) {
        if (!evolutionChain?.length) {
            setShowEvolutionChain([]);
            return;
        }

        setIsShowingEvolutionChain(true);

        const allNames = new Set();
        evolutionChain.forEach(path => {
            path.forEach(stage => allNames.add(stage.name));
        });

        const missing = [...allNames].filter(name => !pokemonInfo[name]);
        if (missing.length > 0) {
            try {
                const missingDetails = await Promise.all(
                    missing.map(async (name) => {
                        try {
                            const details = await fetchPokemonDetails(name);
                            return { [name]: details };
                        } catch (error) {
                            console.error(`Failed to load evolution member ${name}:`, error);
                            return null;
                        }
                    })
                );

                const newInfo = missingDetails.filter(Boolean).reduce((acc, curr) => ({ ...acc, ...curr }), {});
                setPokemonInfo(prev => ({ ...prev, ...newInfo }));
            } catch (error) {
                console.error("Evolution loading error:", error);
                setErrorMsg("Failed to load evolution data.");
                return;
            }
        }

        setShowEvolutionChain(evolutionChain);
    }

    // reset ( gen -> all and type -> all)
    function resetToAll() {
        setCurrGen("all");
        setCurrType("all");
        setSearchText("");
        setDisplayList(allPokemon);
        setVisibleCount(LIMIT);
        setErrorMsg("");

        const visible = allPokemon.slice(0, LIMIT);
        const needsLoading = visible.filter(p => !pokemonInfo[p.name]);
        if (needsLoading.length > 0) {
            loadPokemonDetails(needsLoading);
        }
    }

    const visiblePokemon = displayList.slice(0, visibleCount);
    const hasMore = visibleCount < displayList.length;

    return (
        <>
            {/* Header */}
            <div ref={headerElem} className="col-span-full w-full flex flex-col md:flex-row px-6 py-6 sm:py-4 sm:px-[2.5vw] gap-4 justify-between items-center shadow-lg bg-slate-100">
                <img src={pokeDeck} alt="Pokedex Logo" className="w-72 object-cover drop-shadow-xl cursor-pointer" onClick={resetToAll} />

                <div className="flex flex-col sm:flex-row gap-3">
                    <label className="flex flex-col">
                        Search by name or ID
                        <input
                            type="text"
                            value={searchText}
                            onChange={(e) => handleSearch(e.target.value)}
                            placeholder="Ex: Pikachu (or) 25"
                            className="w-full h-10 p-3 border-2 rounded-lg bg-white hover:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition inset-shadow-md"
                        />
                    </label>

                    <div className={`flex gap-3`}>
                        <label className="grow flex flex-col">
                            Generation
                            <select
                                value={currGen}
                                onChange={(e) => setCurrGen(e.target.value)}
                                className="min-w-24 h-10 px-3 rounded-lg border-2 bg-white hover:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition inset-shadow-md"
                            >
                                <option value="all">All</option>
                                {Array(9).fill(null).map((_, idx) => {
                                    const gen = idx + 1;
                                    return <option key={'mpm-'+gen} value={gen}>{gen}</option>
                                })}
                            </select>
                        </label>

                        <label className="grow flex flex-col">
                            Type
                            <select
                                value={currType}
                                onChange={(e) => setCurrType(e.target.value)}
                                className="h-10 px-3 rounded-lg border-2 bg-white hover:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition inset-shadow-md"
                            >
                                <option value="all">All</option>
                                {TYPES.map(type => (
                                    <option key={'mpm-'+type} value={type}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>
            </div>

            {/* Error */}
            {errorMsg && (
                <div className="mx-10 my-4 p-4 bg-red-100 border border-red-300 text-red-900 rounded-md flex justify-between items-center">
                    <span>{errorMsg}</span>
                    <div className="flex gap-2">
                        <button
                            onClick={resetToAll}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Reset
                        </button>
                        <button
                            onClick={() => setErrorMsg("")}
                            className="px-3 py-1 bg-white border rounded hover:bg-gray-50"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* results count & scroll to top */}
            <div
                className={`
                    w-fit px-6 py-2 bg-gray-900/50 rounded-full sticky top-8 z-10
                    mx-auto mt-10 text-xl text-slate-100 shadow-xs shadow-gray-500 cursor-pointer
                `}
                onClick={() => {
                    if (isScrolled) headerElem.current.scrollIntoView({ behavior: "smooth" })
                }}
            > {
                isScrolled
                    ? (
                        <div className={`flex gap-3`}>
                            <img className={`w-5`} src={upArrow} alt={`\u2191`} />
                            Scroll to Top
                            <img className={`w-5`} src={upArrow} alt={`\u2191`} />
                        </div>
                    )
                    : `${displayList.length} Pokémon Results`
            } </div>

            {/* Grid */}
            <div className="px-10 py-10 grid grid-cols-[repeat(auto-fit,21rem)] justify-center gap-x-10 gap-y-14">
                {visiblePokemon.map((pokemon) => {
                    const pokemonData = pokemonInfo[pokemon.name];

                    return (
                        <div key={'mpm-'+pokemon.id} className="flex flex-col gap-6">
                            {pokemonData ? (
                                <Pokemon pokemon={pokemonData} setShowEvolutionChain={setShowEvolutionChain} />
                            ) : (
                                <div className="w-[21rem] aspect-square bg-slate-300 rounded-2xl shadow-md animate-pulse" />
                            )}

                            <div className="w-[21rem] h-[2.75rem]">
                                {pokemonData ? (
                                    <button
                                        onClick={() => openEvolutionChain(pokemonData.evolutionChain)}
                                        className="w-full h-full bg-[#E63946]/90 text-white rounded-md font-semibold shadow-lg transition"
                                    >
                                        Evolution Chain
                                    </button>
                                ) : (
                                    <div className="w-full h-full bg-slate-300 rounded-md animate-pulse" />
                                )}
                            </div>
                        </div>
                    );
                })}

                {/* Load */}
                {!isInitialLoad && (
                    <div className="w-full col-start-1 -col-end-1 flex justify-center">
                        {hasMore ? (
                            <button
                                onClick={loadMore}
                                disabled={isLoading}
                                className="w-64 h-14 bg-[#f49545] hover:bg-[#e8844a] disabled:opacity-80 text-white text-xl font-semibold rounded-md transition flex items-center justify-center"
                            >
                                {isLoading ? <Load /> : 'Load More Pokemon'}
                            </button>
                        ) : (
                            <h1 className="text-3xl font-bold text-center">
                                {displayList.length === 0
                                    ? "No Pokémon found..."
                                    : "You have reached the end of the deck..."
                                }
                            </h1>
                        )}
                    </div>
                )}
            </div>

            {/* Evolution Modal */}
            {isShowingEvolutionChain && (
                <EvolutionChain
                    setIsShowingEvolutionChain={setIsShowingEvolutionChain}
                    showEvolutionChain={showEvolutionChain}
                    setShowEvolutionChain={setShowEvolutionChain}
                    pokemonInfo={pokemonInfo}
                />
            )}

            {/* Footer */}
            <div className={`mt-auto`}>
                <Footer />
            </div>
        </>
    );
}

export default PokemonGrid;