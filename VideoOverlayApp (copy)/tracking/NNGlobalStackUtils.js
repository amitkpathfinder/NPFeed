import { NativeModules, Platform } from 'react-native';
import { NNTrackingDataHandler } from './NNTrackingDataHandler';

export const KEY_ID_STACK_KEY = 'keyIdStack';
export const COMBINED_KEY_SEPARATOR = '_';
export const ORPHANED_NNTABTRACKING_BASE_PREFIX = 'ORPHANED_NNTAB_BASE';
export const ORPHANED_STACK_PREFIX = 'ORPHANED_STACK';

export const logWithNative = (message) => {
    if(Platform.OS == 'android') {
        if (NativeModules.RNHPModule && NativeModules.RNHPModule.prodLogger) {
            NativeModules.RNHPModule.prodLogger(`NNGlobalStackUtils: ${message}`);
        } else {
            console.log(`NNGlobalStackUtils_LOG_FALLBACK: ${message}`);
        }
    }
};

export const getKeyIdStack = () => {
    const stack = NNTrackingDataHandler.getData(KEY_ID_STACK_KEY);
    return Array.isArray(stack) ? [...stack] : [];
};

export const saveKeyIdStack = (stack) => {
    if (Array.isArray(stack)) {
        NNTrackingDataHandler.setData(KEY_ID_STACK_KEY, [...stack]); // Ensure saving a copy
    } else {
        logWithNative(`ERROR: Attempted to save non-array to keyIdStack: ${JSON.stringify(stack)}`);
    }
};

export const pushToGlobalStackIfNotTop = (combinedKey) => {
    let stack = getKeyIdStack();
    if (stack.length === 0 || stack[stack.length - 1] !== combinedKey) {
        stack.push(combinedKey);
        saveKeyIdStack(stack);
        logWithNative(`Pushed '${combinedKey}'. Stack: ${JSON.stringify(stack)}`);
    } else {
        // logWithNative(`Skipped push for '${combinedKey}', already top. Stack: ${JSON.stringify(stack)}`);
    }
};

export const popFromGlobalStackIfMatches = (combinedKey) => {
    let stack = getKeyIdStack();
    if (stack.length > 0 && stack[stack.length - 1] === combinedKey) {
        const popped = stack.pop();
        saveKeyIdStack(stack);
        logWithNative(`Popped '${popped}' (matched). Stack: ${JSON.stringify(stack)}`);
        return popped;
    } else {
        if (stack.length > 0) {
            logWithNative(`Skipped pop for '${combinedKey}', top is '${stack[stack.length - 1]}'. Stack: ${JSON.stringify(stack)}`);
        } else {
            logWithNative(`Skipped pop for '${combinedKey}', stack is empty.`);
        }
        return null; // Or undefined, to indicate no pop occurred
    }
};

export const pushToKeyIdStack = (keyId) => {
    if (!keyId) {
        logWithNative(`ERROR: Attempted to push undefined/null keyId to stack.`);
        return;
    }
    let stack = getKeyIdStack();
    stack.push(keyId);
    saveKeyIdStack(stack);
    logWithNative(`Pushed '${keyId}' to keyIdStack. Stack: ${JSON.stringify(stack)}`);
};

export const removeLastOccurrenceFromGlobalStack = (keyId) => {
    if (!keyId) {
        logWithNative(`ERROR: Attempted to remove undefined/null keyId from stack.`);
        return false;
    }
    let stack = getKeyIdStack();
    const indexToRemove = stack.lastIndexOf(keyId);

    if (indexToRemove !== -1) {
        stack.splice(indexToRemove, 1);
        saveKeyIdStack(stack);
        logWithNative(`Removed last occurrence of '${keyId}'. Stack: ${JSON.stringify(stack)}`);
        return true;
    } else {
        logWithNative(`WARN: Attempted to remove '${keyId}', but it was not found in the stack. Stack: ${JSON.stringify(stack)}`);
        return false;
    }
};

// --- NNTabTracking Specific Utilities ---

export const handleTabFocusEffect = (currentTabScreenName, baseKeyIdForTabs) => {
    // logWithNative(`TabFocusEffect: Screen='${currentTabScreenName}', BaseKey='${baseKeyIdForTabs}'`);
    if (!baseKeyIdForTabs) {
        logWithNative(`TabFocusEffect: baseKeyIdForTabs is null. Skipping stack update for '${currentTabScreenName}'.`);
        return;
    }

    const expectedCombinedKey = `${baseKeyIdForTabs}${COMBINED_KEY_SEPARATOR}${currentTabScreenName}`;
    let stack = getKeyIdStack();
    logWithNative(`TabFocusEffect (${currentTabScreenName}): Stack before: ${JSON.stringify(stack)}`);

    const topOfStack = stack.length > 0 ? stack[stack.length - 1] : null;

    if (topOfStack !== expectedCombinedKey) {
        // If the current top of stack is a sibling tab (shares the same baseKeyId) or the baseKeyId itself, pop it.
        if (topOfStack && (topOfStack.startsWith(baseKeyIdForTabs + COMBINED_KEY_SEPARATOR) || topOfStack === baseKeyIdForTabs)) {
            stack.pop();
            logWithNative(`TabFocusEffect (${currentTabScreenName}): Popped previous '${topOfStack}'.`);
        }
        stack.push(expectedCombinedKey); // Push the new focused tab's key
        saveKeyIdStack(stack);
        logWithNative(`TabFocusEffect (${currentTabScreenName}): Pushed '${expectedCombinedKey}'. Stack after: ${JSON.stringify(stack)}`);
    } else {
        logWithNative(`TabFocusEffect (${currentTabScreenName}): Key '${expectedCombinedKey}' is already on top.`);
    }
};

export const handleTabLayoutEffectMount = (currentTabScreenName, baseKeyIdForTabs) => {
    // logWithNative(`TabLayoutMount: Screen='${currentTabScreenName}', BaseKey='${baseKeyIdForTabs}'`);
    if (!baseKeyIdForTabs) {
        // logWithNative(`TabLayoutMount: baseKeyIdForTabs is null. Cannot construct combined key for '${currentTabScreenName}'.`);
        return null;
    }
    const newCombinedKey = `${baseKeyIdForTabs}${COMBINED_KEY_SEPARATOR}${currentTabScreenName}`;
    // Removed stack modification from here. Stack updates for tabs are handled by handleTabFocusEffect.
    // logWithNative(`TabLayoutMount: Constructed key '${newCombinedKey}'. Stack modification will be handled by focus effect.`);
    return newCombinedKey; // Return the key to be stored in component's state for cleanup
};

export const handleTabLayoutEffectCleanup = (thisInstanceCombinedKey, baseKeyIdForTabs, currentTabScreenName) => {
    logWithNative(`TabLayoutCleanup: InstanceKey='${thisInstanceCombinedKey}', BaseKey='${baseKeyIdForTabs}', Screen='${currentTabScreenName}'`);
    if (!thisInstanceCombinedKey || !baseKeyIdForTabs) {
        logWithNative(`TabLayoutCleanup: Skipped. InstanceKey ('${thisInstanceCombinedKey}') or BaseKey ('${baseKeyIdForTabs}') is null for '${currentTabScreenName}'.`);
        return;
    }

    let stack = getKeyIdStack();
    logWithNative(`TabLayoutCleanup (${currentTabScreenName}): Stack before: ${JSON.stringify(stack)}`);

    // Only pop if this instance's key is on top. Then push the baseKeyIdForTabs.
    if (stack.length > 0 && stack[stack.length - 1] === thisInstanceCombinedKey) {
        stack.pop(); // Pop this tab's combined key
        logWithNative(`TabLayoutCleanup (${currentTabScreenName}): Popped '${thisInstanceCombinedKey}'.`);
        // Check if baseKeyIdForTabs is already on top (e.g. another tab focused and pushed it)
        if (stack.length === 0 || stack[stack.length-1] !== baseKeyIdForTabs) {
            stack.push(baseKeyIdForTabs); // Restore the base key for this NNTabTracking group
            logWithNative(`TabLayoutCleanup (${currentTabScreenName}): Pushed base '${baseKeyIdForTabs}'.`);
        } else {
            logWithNative(`TabLayoutCleanup (${currentTabScreenName}): Base '${baseKeyIdForTabs}' already top, not re-pushing.`);
        }
        saveKeyIdStack(stack);
        logWithNative(`TabLayoutCleanup (${currentTabScreenName}): Stack after: ${JSON.stringify(stack)}`);
    } else {
        logWithNative(`TabLayoutCleanup (${currentTabScreenName}): Skipped stack pop. Top ('${stack.length > 0 ? stack[stack.length - 1] : 'empty'}') != InstanceKey ('${thisInstanceCombinedKey}').`);
    }
};

export const handleTabTrackerMount = (initialRouteName) => {
    // logWithNative(`TabTrackerMount: InitialRoute='${initialRouteName}'`);
    let stack = getKeyIdStack();
    let baseKeyIdForTabs;

    if (stack.length > 0) {
        baseKeyIdForTabs = stack.pop(); // This is the key from the parent navigator (e.g., a Stack screen)
        logWithNative(`TabTrackerMount: Popped '${baseKeyIdForTabs}' as baseKeyId. Stack now: ${JSON.stringify(stack)}`);
    } else {
        baseKeyIdForTabs = `${ORPHANED_NNTABTRACKING_BASE_PREFIX}_${initialRouteName || 'UnknownInitial'}_${Date.now()}`;
        logWithNative(`TabTrackerMount: Global stack empty. Generated orphaned baseKey: '${baseKeyIdForTabs}'. Stack remains: ${JSON.stringify(stack)}`);
    }
    saveKeyIdStack(stack); // Save stack (it's changed if something was popped)
    return baseKeyIdForTabs;
};


// --- NNStackTracking Specific Utilities ---

export const handleStackScreenMountFocus = (screenIdentifier, baseKeyId, originalScreenName) => {
    // logWithNative(`StackScreenMountFocus: ID='${screenIdentifier}', BaseKey='${baseKeyId}', Original='${originalScreenName}'`);
    if (!baseKeyId || baseKeyId.startsWith(ORPHANED_STACK_PREFIX)) {
        logWithNative(`StackScreenMountFocus: WARN - Cannot push to global stack, invalid baseKeyId ('${baseKeyId}') for screen: ${screenIdentifier}`);
        return;
    }
    const combinedKey = `${baseKeyId}${COMBINED_KEY_SEPARATOR}${screenIdentifier}`;
    pushToGlobalStackIfNotTop(combinedKey);
};

export const handleStackScreenBeforeRemove = (screenIdentifier, baseKeyId, originalScreenName) => {
    logWithNative(`StackScreenBeforeRemove: ID='${screenIdentifier}', BaseKey='${baseKeyId}', Original='${originalScreenName}'`);
    if (!baseKeyId || baseKeyId.startsWith(ORPHANED_STACK_PREFIX)) {
        logWithNative(`StackScreenBeforeRemove: WARN - Cannot pop from global stack, invalid baseKeyId ('${baseKeyId}') for screen: ${screenIdentifier}`);
        return;
    }
    const combinedKey = `${baseKeyId}${COMBINED_KEY_SEPARATOR}${screenIdentifier}`;
    popFromGlobalStackIfMatches(combinedKey);
};

export const handleStackTrackerMount = (initialRouteName, setScreenNameReduxAction) => {
    // logWithNative(`StackTrackerMount: InitialRoute='${initialRouteName}'`);
    let stack = getKeyIdStack();
    let poppedKey = null;
    let actualBaseKeyId;

    if (stack.length > 0) {
        poppedKey = stack.pop(); // This key is the one that identifies this stack navigator instance.
        actualBaseKeyId = poppedKey;
        logWithNative(`StackTrackerMount: Popped '${actualBaseKeyId}' as baseKey. Stack now: ${JSON.stringify(stack)}`);
        saveKeyIdStack(stack); // Save stack after popping base

        // Now, push the initial screen of this stack navigator, prefixed with the baseKeyId
        const initialScreenCombinedKey = `${actualBaseKeyId}${COMBINED_KEY_SEPARATOR}${initialRouteName}`;
        pushToGlobalStackIfNotTop(initialScreenCombinedKey);
        if (setScreenNameReduxAction) setScreenNameReduxAction(initialRouteName);

    } else {
        actualBaseKeyId = `${ORPHANED_STACK_PREFIX}_${initialRouteName || 'UnknownInitial'}_${Date.now()}`;
        logWithNative(`StackTrackerMount: WARN - Global stack empty! Using placeholder baseKey: '${actualBaseKeyId}'. Stack: ${JSON.stringify(stack)}`);
        // No modification to global stack if it started empty. The initial screen will be pushed by its OverrideChildrenComponent
        // but won't be "globally" meaningful without a proper parent key.
        if (setScreenNameReduxAction) setScreenNameReduxAction(initialRouteName);
    }
    return actualBaseKeyId;
};

export const handleStackTrackerUnmount = (baseKeyIdPoppedByMount) => {
    logWithNative(`StackTrackerUnmount: BaseKeyPoppedByMount='${baseKeyIdPoppedByMount}'. This key will NOT be restored.`);
    if (!baseKeyIdPoppedByMount || baseKeyIdPoppedByMount.startsWith(ORPHANED_STACK_PREFIX)) {
        logWithNative(`StackTrackerUnmount: Skipping cleanup as BaseKeyPoppedByMount was invalid or orphaned ('${baseKeyIdPoppedByMount}').`);
        return;
    }

    let stack = getKeyIdStack();
    // The baseKeyIdPoppedByMount is the key of the screen/navigator *containing* this StackTracker.
    // When this StackTracker unmounts, its children should be popped.
    // The baseKeyIdPoppedByMount (parent context) should NOT be pushed back, as this entire navigator context is being removed.
    const expectedPrefixForChildren = `${baseKeyIdPoppedByMount}${COMBINED_KEY_SEPARATOR}`;

    // Iteratively pop any children of this stack navigator that might still be on top.
    while (stack.length > 0 && typeof stack[stack.length - 1] === 'string' && stack[stack.length - 1].startsWith(expectedPrefixForChildren)) {
        const poppedChildOnUnmount = stack.pop();
        logWithNative(`StackTrackerUnmount: Popped lingering child '${poppedChildOnUnmount}'.`);
    }
    
    // After children are cleared, we check if the baseKeyIdPoppedByMount is on top.
    // If it is, it means this key was somehow restored or was the direct child's base.
    // More likely, it means the stack was: [..., ParentKeyPoppedByMount, ParentKeyPoppedByMount_ChildScreen]
    // Child is popped. Now if ParentKeyPoppedByMount is top, it should ALSO be popped as this whole context is gone.
    if (stack.length > 0 && stack[stack.length - 1] === baseKeyIdPoppedByMount) {
        stack.pop();
        logWithNative(`StackTrackerUnmount: Popped BaseKeyPoppedByMount ('${baseKeyIdPoppedByMount}') as it was on top and this navigator is unmounting.`);
    }

    saveKeyIdStack(stack);
    logWithNative(`StackTrackerUnmount: Final Stack (BaseKeyPoppedByMount '${baseKeyIdPoppedByMount}' is NOT restored): ${JSON.stringify(getKeyIdStack())}`);
};

export const handleTabTrackerUnmount = (baseKeyIdForTabsPoppedByMount) => {
    logWithNative(`TabTrackerUnmount: BaseKeyForTabsPoppedByMount='${baseKeyIdForTabsPoppedByMount}'. This key will NOT be restored.`);
    if (!baseKeyIdForTabsPoppedByMount || baseKeyIdForTabsPoppedByMount.startsWith(ORPHANED_NNTABTRACKING_BASE_PREFIX)) {
        logWithNative(`TabTrackerUnmount: Skipping cleanup for orphaned or null BaseKeyForTabsPoppedByMount: '${baseKeyIdForTabsPoppedByMount}'.`);
        return;
    }
    let stack = getKeyIdStack();
    const expectedPrefixForChildren = `${baseKeyIdForTabsPoppedByMount}${COMBINED_KEY_SEPARATOR}`;

    // Iteratively pop any child tabs of this TabTracker that might still be on top.
    while (stack.length > 0 && typeof stack[stack.length - 1] === 'string' && stack[stack.length - 1].startsWith(expectedPrefixForChildren)) {
        const poppedChildOnUnmount = stack.pop();
        logWithNative(`TabTrackerUnmount: Popped lingering child tab '${poppedChildOnUnmount}'.`);
    }

    // After children tabs are cleared, if BaseKeyForTabsPoppedByMount is on top, pop it too.
    if (stack.length > 0 && stack[stack.length - 1] === baseKeyIdForTabsPoppedByMount) {
        stack.pop();
        logWithNative(`TabTrackerUnmount: Popped BaseKeyForTabsPoppedByMount ('${baseKeyIdForTabsPoppedByMount}') as it was on top and this tab navigator is unmounting.`);
    }

    saveKeyIdStack(stack);
    logWithNative(`TabTrackerUnmount: Final stack state (BaseKeyForTabsPoppedByMount '${baseKeyIdForTabsPoppedByMount}' is NOT restored): ${JSON.stringify(getKeyIdStack())}`);
};