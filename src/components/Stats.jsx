function Stats(props) {
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

    const BarElems = props.stats.map((statItem) => {
        const color = STAT_COLORS[statItem.stat.name];
        const percentage = statItem.base_stat / MAX_STATS[statItem.stat.name] * 100;
        const name = statItem.stat.name.split('-').map((str) => {
            if (str === 'hp') return 'HP';
            if (str === 'special') return 'Spl.'
            return str.charAt(0).toUpperCase() + str.slice(1)
        }).join(' ');

        return (
            <div key={statItem.stat.name} className={`w-max col-span-3 grid grid-cols-subgrid gap-3 text-base`}>
                <div className={`justify-self-end`}>{name}</div>
                <div className={`font-semibold justify-self-end`}>{statItem.base_stat}</div>
                <div className={`w-28 h-3 rounded overflow-clip bg-gray-300  place-self-center`}>
                    <div style={{width: `${percentage}%`, backgroundColor: color}} className={`h-full rounded opacity-0 animate-bar-fill`}></div>
                    {/*<div className={`w-full h-full absolute top-0 right-0 bg-gray-300 animate-slide-out`}></div>*/}
                </div>
            </div>
        );
    });

    return (
        <div className={`h-52 grid grid-cols-[repeat(3,max-content)] place-content-center gap-3`}>
            {BarElems}
        </div>
    )
}

export default Stats;