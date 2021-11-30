import React from "react";

export function LinkButton({children, onClick, isDisabled, id}: {children: React.ReactNode, onClick?: () => void, isDisabled?: boolean, id?: string}) {
    return <button id={id} className={isDisabled ? 'strawberryLinkButtonDisabled' : 'strawberryLinkButton'} onClick={isDisabled ? undefined : onClick} disabled={!!isDisabled}>
        {children}
    </button>
}