import github from "../assets/github.svg";
import linkedIn from "../assets/linked-in.svg";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 text-base py-6 mt-10">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <p>
                    Powered by{" "}
                    <a
                        href="https://pokeapi.co/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                    >
                        PokéAPI
                    </a>
                </p>

                <div className="flex gap-3 items-center">
                    <p className={`mr-1`}>
                        © {new Date().getFullYear()} M. Pavan Mahesh
                    </p>

                    <a
                        href="https://github.com/Pavan-Mahesh/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white"
                    >
                        <img className={`w-4`} src={github} alt="Github Logo" />
                    </a>

                    <a
                        href="https://linkedin.com/in/mukkamula-pavan-mahesh/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white"
                    >
                        <img className={`w-4`} src={linkedIn} alt="Github Logo" />
                    </a>
                </div>
            </div>

            <p className={`mt-6 text-center text-sm`} >Built with React + Tailwind CSS</p>

            <p className="text-center text-sm mt-2 text-gray-500">
                This is a fan project. Pokémon and Pokémon character names are trademarks of Nintendo/Game Freak.
            </p>
        </footer>
    );
}
