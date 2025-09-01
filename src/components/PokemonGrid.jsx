import React from "react";

import Load from "./Load.jsx";
import Pokemon from "./Pokemon.jsx";
import EvolutionChain from "./EvolutionChain.jsx";
import Footer from "./Footer.jsx";

import pokeDeck from "../assets/pokedeck.png";
import upArrow from "../assets/up-arrow.svg";

const POKEDEX_URL = 'https://pokeapi.co/api/v2/pokedex/1';
const TYPE_URL = 'https://pokeapi.co/api/v2/type/';
const LIMIT = 12;

const TYPES = [
    "normal", "fighting", "flying", "poison", "ground", "rock", "bug", "ghost",
    "steel", "fire", "water", "grass", "electric", "psychic", "ice", "dragon", "dark", "fairy"
];

function PokemonGrid({ mainElem }) {
    // Core state
    const [allPokemon, setAllPokemon] = React.useState([]); // Master list from pokedex
    const [typeList, setTypeList] = React.useState([]); // All Pokémon of choose type
    const [displayList, setDisplayList] = React.useState([]); // What we show (filtered/searched)
    const [pokemonInfo, setPokemonInfo] = React.useState({}); // Detailed pokemon data

    // UI state
    const [searchText, setSearchText] = React.useState("");
    const [currType, setCurrType] = React.useState("all");
    const [showEvolutionChain, setShowEvolutionChain] = React.useState([]);
    const [isScrolled, setIsScrolled] = React.useState(false);

    // Loading states
    const [isLoading, setIsLoading] = React.useState(false);
    const [isShowingEvolutionChain, setIsShowingEvolutionChain] = React.useState(false);
    const [isInitialLoad, setIsInitialLoad] = React.useState(true);
    const [errorMsg, setErrorMsg] = React.useState("");

    // Pagination
    const [visibleCount, setVisibleCount] = React.useState(LIMIT);

    // HTML References
    const headerElem = React.useRef(null);

    // Load initial Pokémon list
    React.useEffect(() => {
        mainElem.current.addEventListener('scroll', () => {
            setIsScrolled(headerElem.current.getBoundingClientRect().top !== 0);
        })

        loadInitialPokemon();
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
            setTypeList(pokemonList);
            setDisplayList(pokemonList);

            // Load first batch of detailed info
            await loadPokemonDetails(pokemonList.slice(0, LIMIT));

        } catch (error) {
            console.error("Initial load error:", error);
            setErrorMsg("Failed to load Pokédex. Please refresh the page.");
        } finally {
            setIsLoading(false);
            setIsInitialLoad(false);
        }
    }

    // Handle type filter changes
    React.useEffect(() => {
        if (isInitialLoad) return;

        loadTypeFilter();
    }, [currType]);

    async function loadTypeFilter() {
        try {
            setIsLoading(true);
            setTypeList([]);
            setDisplayList([]);
            setVisibleCount(LIMIT);

            let newTypeList = allPokemon;
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
            }

            const filtered = applySearch(newTypeList, searchText);
            setTypeList(newTypeList);
            setDisplayList(filtered);

            // Load first batch
            await loadPokemonDetails(filtered.slice(0, LIMIT));

        } catch (error) {
            console.error("Type filter error:", error);
            setErrorMsg("Failed to load that type. Try again.");
        } finally {
            setIsLoading(false);
        }
    }

    // Search functionality
    function applySearch(list, query) {
        if (!query.trim()) return list;

        query = query.replaceAll(" ", "");
        const searchLower = query.toLowerCase();
        const searchNumber = parseInt(query);

        return list.filter(pokemon =>
            pokemon.name.toLowerCase().includes(searchLower) ||
            pokemon.id === searchNumber
        );
    }

    function handleSearch(value) {
        setSearchText(value);

        const baseList = currType === "all" ? allPokemon : typeList;
        const filtered = applySearch(baseList, value);

        setDisplayList(filtered);
        setVisibleCount(LIMIT);

        // Load details for visible pokemon
        const visible = filtered.slice(0, LIMIT);
        const needsLoading = visible.filter(p => !pokemonInfo[p.name]);
        if (needsLoading.length > 0) {
            loadPokemonDetails(needsLoading);
        }
    }

    // Load more pokemon
    async function loadMore() {
        const nextBatch = displayList.slice(visibleCount, visibleCount + LIMIT);
        await loadPokemonDetails(nextBatch);
        setVisibleCount(prev => prev + LIMIT);
    }

    // Load detailed Pokémon information
    async function loadPokemonDetails(pokemonList) {
        if (!pokemonList.length) return;

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
            const newInfo = results.filter(Boolean).reduce((acc, curr) => ({...acc, ...curr}), {});

            setPokemonInfo(prev => ({...prev, ...newInfo}));

        } catch (error) {
            console.error("Batch loading error:", error);
            setErrorMsg("Failed to load some Pokémon details.");
        } finally {
            setIsLoading(false);
        }
    }

    // Fetch individual Pokémon details
    async function fetchPokemonDetails(pokemonId) {
        const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`;
        const speciesResponse = await fetch(speciesUrl);
        if (!speciesResponse.ok) throw new Error("Species fetch failed");

        const speciesData = await speciesResponse.json();

        const pokemonUrl = speciesData.varieties?.find(v => v.is_default)?.pokemon?.url;
        if (!pokemonUrl) throw new Error("No default pokemon variant");

        const pokemonResponse = await fetch(pokemonUrl);
        if (!pokemonResponse.ok) throw new Error("Pokemon fetch failed");

        const pokemonData = await pokemonResponse.json();

        // Get flavor text
        const flavorEntry = speciesData.flavor_text_entries?.find(entry =>
            entry.language.name === "en" && entry.flavor_text.length <= 200
        );

        // Calculate height and weight
        const heightM = pokemonData.height / 10;
        const weightKg = pokemonData.weight / 10;
        const totalInches = heightM * 39.37;
        const feet = Math.floor(totalInches / 12);
        const inches = Math.round(totalInches % 12);
        const lbs = (weightKg * 2.20462).toFixed(1);

        // Format stats
        const stats = pokemonData.stats.map(stat => ({
            name: stat.stat.name.split("-").map(word => {
                if (word === "hp") return "HP";
                if (word === "special") return "Spl.";
                return word.charAt(0).toUpperCase() + word.slice(1);
            }).join(" "),
            base_stat: stat.base_stat
        }));

        // Get evolution chain
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

    // Parse evolution chain
    function parseEvolutionChain(chain) {
        const paths = [];

        function traverse(node, currentPath = []) {
            const newPath = [...currentPath, {
                name: node.species.name,
                id: parseInt(node.species.url.match(/\/(\d+)\/$/)[1])
            }];

            if (node.evolves_to.length === 0) {
                paths.push(newPath);
            } else {
                node.evolves_to.forEach(evolution => traverse(evolution, newPath));
            }
        }

        traverse(chain);
        return paths;
    }

    // Handle evolution chain modal
    async function openEvolutionChain(evolutionChain) {
        if (!evolutionChain?.length) {
            setShowEvolutionChain([]);
            return;
        }

        setIsShowingEvolutionChain(true);

        // Get all pokémon names from evolution chain
        const allNames = new Set();
        evolutionChain.forEach(path => {
            path.forEach(stage => allNames.add(stage.name));
        });

        // Load missing pokémon info
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

                const newInfo = missingDetails.filter(Boolean).reduce((acc, curr) => ({...acc, ...curr}), {});
                setPokemonInfo(prev => ({...prev, ...newInfo}));
            } catch (error) {
                console.error("Evolution loading error:", error);
                setErrorMsg("Failed to load evolution data.");
                return;
            }
        }

        setShowEvolutionChain(evolutionChain);
    }

    // Reset to "all" type
    function resetToAll() {
        setCurrType("all");
        const filtered = applySearch(allPokemon, searchText);
        setDisplayList(filtered);
        setVisibleCount(LIMIT);
        setErrorMsg("");

        // Load visible pokemon that aren't loaded yet
        const visible = filtered.slice(0, LIMIT);
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
            <div ref={headerElem} className="col-span-full w-full flex flex-col sm:flex-row px-6 py-6 sm:py-4 sm:px-[2.5vw] gap-4 justify-between items-center shadow-lg bg-slate-100">
                <img src={pokeDeck} alt="Pokedex Logo" className="w-72 object-cover drop-shadow-xl" />

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

                    <label className="flex flex-col">
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

            {/* Error Message */}
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

            {/* Pokemon Grid */}
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

                {/* Load More Button */}
                {!isInitialLoad && (
                    <div className="w-full col-start-1 -col-end-1 flex justify-center">
                        {hasMore ? (
                            <button
                                onClick={loadMore}
                                disabled={isLoading}
                                className="w-64 h-14 bg-[#f49545] hover:bg-[#e8844a] disabled:opacity-50 text-white text-xl font-semibold rounded-md transition flex items-center justify-center"
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

            {/* Evolution Chain Modal */}
            {isShowingEvolutionChain > 0 && (
                <EvolutionChain
                    setIsShowingEvolutionChain={setIsShowingEvolutionChain}
                    showEvolutionChain={showEvolutionChain}
                    setShowEvolutionChain={setShowEvolutionChain}
                    pokemonInfo={pokemonInfo}
                />
            )}

            <div className={`mt-auto`}>
                <Footer />
            </div>
        </>
    );
}

export default PokemonGrid;