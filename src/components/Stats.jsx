import React from "react";

// const STAT_COLORS = {
//     'HP': `#66BB6A`,
//     'Attack': `#FB8C00`,
//     'Defense': `#42A5F5`,
//     'Spl. Attack': `#EF5350`,
//     'Spl. Defense': `#ad62f6`,
//     'Speed': `#FDD835`,
// }

const STAT_COLORS = {
    'HP': `#8BC34A`,
    'Attack': `#FF9800`,
    'Defense': `#03A9F4`,
    'Spl. Attack': `#E91E63`,
    'Spl. Defense': `#9C27B0`,
    'Speed': `#FDD835`,
}

const MAX_STATS = {
    'HP': 255,
    'Attack': 190,
    'Defense': 230,
    'Spl. Attack': 194,
    'Spl. Defense': 230,
    'Speed': 200
};

function Stats({ stats, flipped }) {
    const BarElems = stats.map((statItem) => {
        const color = STAT_COLORS[statItem.name];
        const percentage = statItem.base_stat / MAX_STATS[statItem.name] * 100;

        return (
            <div key={statItem.name} className={`col-span-4 grid grid-cols-subgrid gap-3 place-items-center`}>
                <div className={`justify-self-start`}>{statItem.name}</div>
                <div className={`relative w-28 h-2.5 rounded bg-gray-300 place-self-center`}>
                    <div style={{width: `${percentage}%`, backgroundColor: color}} className={`h-full rounded ${flipped && 'animate-bar-fill'}`}></div>
                </div>
                <div className={`justify-self-end`}>{statItem.base_stat} / {MAX_STATS[statItem.name]}</div>
            </div>
        );
    });

    return (
        <div className={`w-full grid grid-cols-[auto 1fr auto] text-sm leading-5.5`}>
            {BarElems}
        </div>
    )
}

export default Stats;