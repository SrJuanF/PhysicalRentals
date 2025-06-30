import { ConnectButton } from "web3uikit"
import Link from "next/link"

export default function Header() {
    return (
        <nav className="nav-header">
            <h1 className="nav-title">Physical Artifact Rentals</h1>
            <div className="nav-links">
                <Link href="/" className="nav-link">
                    Home
                </Link>
                <Link href="/createTool" className="nav-link">
                    Create Tool
                </Link>
                <ConnectButton moralisAuth={false} />
            </div>
        </nav>
    );
}
