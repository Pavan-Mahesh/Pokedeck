function EvolutionChain({ evolutionChain, setShowEvolutionChain}) {
    return (
        // pokemon.evolutionChain.map((path, idx) => {
        //     return (
        //         <div className={'flex flex-col'} key={pokemon.name + idx}>{
        //             path.map((stage) => {
        //                 return <img key={pokemon.name + stage.name} className={'w-20 saturate-150'} src={IMG_URL + stage.id + '.png'} alt={stage.name} />
        //             })
        //         }</div>
        //     )
        // })
        <div className={`absolute top-0 left-0 w-full h-full bg-black/80`} onClick={() => setShowEvolutionChain([])}></div>
    );
}

export default EvolutionChain;