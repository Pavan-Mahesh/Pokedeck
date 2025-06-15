import React from "react";

function Pokemon(props) {
    const tilt = React.useRef(Math.random() * (6 - (-6)) + (-6))

    function onCardSelect(event) {
        event.preventDefault();
        props.setSelected(props.pokemon);
    }

    return (
        <div
            style={{transform: `rotate(${tilt.current}deg)`}}
            className={`
                w-full h-max py-4 bg-white rounded-xl shadow-md flex flex-col gap-2 justify-between items-center ${props.isSelected && !props.animateBack && 'opacity-0'} transition-opacity ease-linear duration-150 ${props.animateBack && 'delay-75'}
            `}
            onClick={onCardSelect}
        >
            <img
                className={'w-44 aspect-square saturate-150 drop-shadow-xl'}
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${props.pokemon.id}.png`}
                alt=""
            />

            <div className="w-full px-5 flex justify-between">
                <div className="text-nowrap text-xl font-semibold">#{props.pokemon.id.toString().padStart(4, "0")}</div>
                <div className="text-nowrap text-xl font-semibold">{props.pokemon.name.toUpperCase()}</div>
            </div>
        </div>
    )
}

export default Pokemon;