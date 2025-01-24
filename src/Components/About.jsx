import Topbar from "./Topbar";

export default function About() {
    return (
        <div>
            <Topbar />
            <p style={{ marginTop: "50px" }}>
                I built this chess website as a personal project in web development. The source code can be found on my github&nbsp;
                <a href="https://github.com/Amitbalter/chess">here</a>.
            </p>
        </div>
    );
}
