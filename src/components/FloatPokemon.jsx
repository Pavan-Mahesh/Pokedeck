import React from "react";

import Types from "./Types.jsx";
import Stats from "./Stats.jsx";
import Load from "./Load.jsx";

const POKEMON_URL = "https://pokeapi.co/api/v2/pokemon/";

function FloatPokemon(props) {
    const [types, setTypes] = React.useState([]);
    const [stats, setStats] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        setIsLoading(true);

        fetch(`${POKEMON_URL}${props.selected.id}`)
            .then((res) => {
                if(!res.ok) throw new Error("Failed to fetch pokemon info");
                return res.json();
            })
            .then((data) => {
                setTypes(data.types);
                setStats(data.stats);
                setTimeout(() => {
                    setIsLoading(false);
                }, 300)
            })
    }, [props.selected.id]);

    return (
        <div className={`w-full h-full flex items-center justify-center top-0 left-0 fixed`}>
            {
                isLoading
                    ? <Load sideText={true} />
                    : <div
                        className={`    
                            min-w-max h-max py-6 px-8 rounded-xl bg-white shadow-2xl flex flex-col items-center gap-2
                            ${props.animateBack ? 'animate-leave' : 'animate-enter'}
                            max-sm:max-h-[95%] max-sm:overflow-y-auto
                        `}
                        onAnimationEnd={() => {
                            if (props.animateBack) {
                                props.setSelected(null);
                                props.setAnimateBack(false);
                            }
                        }}
                    >
                        <div className={`w-full flex justify-between items-center max-sm:flex-col max-sm:gap-3`}>
                            <div className="flex items-center gap-3 text-nowrap font-semibold text-xl">
                                <div>#{props.selected.id.toString().padStart(4, "0")}</div>
                                <div>{props.selected.name.toUpperCase()}</div>
                            </div>

                            <Types types={types}/>
                        </div>

                        <div className={`flex gap-2 max-sm:flex-col items-center`}>
                            <img
                                className="w-52 aspect-square saturate-150 drop-shadow-xl max-sm:my-2"
                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${props.selected.id}.png`}
                                alt=""
                            />

                            <Stats stats={stats}/>
                        </div>
                    </div>
            }

            <div
                className={`
                    absolute -z-1 w-full h-full bg-gray-950 opacity-50
                    ${props.animateBack ? 'animate-fade-out' : 'animate-fade-in'}
                `}
                onClick={() => props.setAnimateBack(true)}
            ></div>
        </div>
    )
}

export default FloatPokemon;