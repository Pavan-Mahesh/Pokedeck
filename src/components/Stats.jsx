import React from "react";

import infoIcon from "../assets/info-icon-svgrepo-com.svg";

const STAT_COLORS = {
    'hp': `#66BB6A`,
    'attack': `#FB8C00`,
    'defense': `#42A5F5`,
    'special-attack': `#EF5350`,
    'special-defense': `#ad62f6`,
    'speed': `#FDD835`,
}

const MAX_STATS = {
    'hp': 255,
    'attack': 190,
    'defense': 230,
    'special-attack': 194,
    'special-defense': 230,
    'speed': 200
};

function Stats(props) {
    const [showTooltip, setShowTooltip] = React.useState(null);

    function handleClick(statName) {
        setShowTooltip(showTooltip === statName ? null : statName)
    }

    const BarElems = props.stats.map((statItem) => {
        const color = STAT_COLORS[statItem.stat.name];
        const percentage = statItem.base_stat / MAX_STATS[statItem.stat.name] * 100;
        const name = statItem.stat.name.split('-').map((str) => {
            if (str === 'hp') return 'HP';
            if (str === 'special') return 'Spl.'
            return str.charAt(0).toUpperCase() + str.slice(1)
        }).join(' ');

        return (
            <div key={statItem.stat.name} className={`w-max col-span-4 grid grid-cols-subgrid gap-3 text- place-items-center`}>
                <div className={`justify-self-end`}>{name}</div>
                <div className={`font-semibold justify-self-end`}>{statItem.base_stat}</div>
                <div className={`relative w-24 h-2 rounded bg-gray-300  place-self-center`}>
                    <div style={{width: `${percentage}%`, backgroundColor: color}} className={`h-full rounded opacity-0 animate-bar-fill`}></div>
                    <div
                        style={{borderColor: color}}
                        className={`
                            w-max absolute z-10 px-2 py-0.5 top-1/2 right-0 -translate-y-1/2 bg-white border-2 rounded-full ${showTooltip === statItem.stat.name ? 'opacity-100' : 'opacity-0'} transition-opacity
                        `}>{`${statItem.base_stat} / ${MAX_STATS[statItem.stat.name]}`}</div>
                </div>
                <button
                    className={`cursor-pointer active:scale-90`}
                    onClick={() => {
                        handleClick(statItem.stat.name)
                    }}
                >
                    <img className={`size-3 opacity-60`} src={infoIcon} alt={'i'} />
                </button>
            </div>
        );
    });

    return (
        <div className={`grid grid-cols-[repeat(4,max-content)] place-content-center`}>
            {BarElems}
        </div>
    )
}

export default Stats;