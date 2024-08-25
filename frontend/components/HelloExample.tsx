import { useEffect, useState } from "react";

import { helloFunction, updateHelloFunction } from "@/services/blockchain";

const HelloExample = () => {
    const [value, setValue] = useState('');
    const [currentMessage, setCurrentMessage] = useState('');

    const getMessage = async () => {
        try {
            const message = await helloFunction();
            setCurrentMessage(message);
        } catch (error) {

        }
    }

    const updateMessage = async () => {
        try {
            if (!value) return;
            const response = await updateHelloFunction(value);
            setValue("");
            getMessage();
        } catch (error) {

        }
    }

    useEffect(() => {
        getMessage();
    }, []);

    return (
        <div className="flex justify-center mt-10">
            <div className="container">
                <div className="flex gap-3 items-center mt-10">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={getMessage}>
                        Get message
                    </button>
                    <p className="text-xl"><span className="font-bold">Current message:</span> {currentMessage}</p>
                </div>
                <div className="flex gap-3  items-center mt-10">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={updateMessage}
                    >Change message</button>
                    <input type="text"
                        className="border-2 border-gray-500"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                    />
                </div>
            </div>
        </div>
    )
}

export default HelloExample