const tabs = document.getElementById('tabs');
    const numbersInput = document.getElementById('numbersInput');
    const quickOptions = document.getElementById('quickOptions');
    const pivotStrategy = document.getElementById('pivotStrategy');
    const sortBtn = document.getElementById('sortBtn');
    const resetBtn = document.getElementById('resetBtn');
    const sampleBtn = document.getElementById('sampleBtn');
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const restartBtn = document.getElementById('restartBtn');
    const speedSelect = document.getElementById('speedSelect');
    const stepProgress = document.getElementById('stepProgress');
    const playerControls = document.getElementById('playerControls');
    const message = document.getElementById('message');
    const stepsContainer = document.getElementById('steps');
    const resultBox = document.getElementById('resultBox');
    const statAlgorithm = document.getElementById('statAlgorithm');
    const statSteps = document.getElementById('statSteps');
    const statTime = document.getElementById('statTime');
    const statLength = document.getElementById('statLength');

    let activeAlgorithm = 'bubble';
    let playbackSteps = [];
    let currentStepIndex = 0;
    let animationTimer = null;

    const algorithmLabels = {
        bubble: 'Bubble Sort',
        selection: 'Selection Sort',
        insertion: 'Insertion Sort',
        quick: 'Quick Sort'
    };

    function setMessage(text, type = '') {
        message.textContent = text;
        message.className = `status ${type}`.trim();
    }

    function stopAnimation() {
        if (animationTimer) {
            clearInterval(animationTimer);
            animationTimer = null;
        }
    }

    function updatePlaybackControls() {
        if (activeAlgorithm === 'quick') {
            playBtn.disabled = true;
            pauseBtn.disabled = true;
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            restartBtn.disabled = true;
            return;
        }

        const hasSteps = playbackSteps.length > 0;
        const atStart = currentStepIndex <= 0;
        const atEnd = currentStepIndex >= playbackSteps.length - 1;

        playBtn.disabled = !hasSteps || !atEnd && !!animationTimer;
        pauseBtn.disabled = !animationTimer;
        prevBtn.disabled = !hasSteps || atStart;
        nextBtn.disabled = !hasSteps || atEnd;
        restartBtn.disabled = !hasSteps;

        stepProgress.textContent = hasSteps
            ? `Step ${currentStepIndex + 1} of ${playbackSteps.length}`
            : 'Step 0 of 0';
    }

    function renderCurrentStep() {
        stepsContainer.innerHTML = '';
        if (!playbackSteps.length) {
            updatePlaybackControls();
            return;
        }

        const step = playbackSteps[currentStepIndex];
        const card = document.createElement('div');
        card.className = 'step-card';

        const title = document.createElement('div');
        title.className = 'step-title';

        const heading = document.createElement('strong');
        heading.textContent = `Step ${currentStepIndex + 1}`;

        const note = document.createElement('span');
        note.className = 'step-note';
        note.textContent = step.note;

        title.appendChild(heading);
        title.appendChild(note);
        card.appendChild(title);
        card.appendChild(renderArray(step.array, step));
        stepsContainer.appendChild(card);

        updatePlaybackControls();
    }

    function setStep(index) {
        if (!playbackSteps.length) return;
        currentStepIndex = Math.max(0, Math.min(index, playbackSteps.length - 1));
        renderCurrentStep();
    }

    function startAnimation() {
        if (!playbackSteps.length || animationTimer) return;

        if (currentStepIndex >= playbackSteps.length - 1) {
            currentStepIndex = 0;
        }

        const intervalMs = Number(speedSelect.value);
        animationTimer = setInterval(() => {
            if (currentStepIndex < playbackSteps.length - 1) {
                currentStepIndex++;
                renderCurrentStep();
            } else {
                stopAnimation();
                updatePlaybackControls();
            }
        }, intervalMs);

        updatePlaybackControls();
    }

    function setActiveAlgorithm(name) {
        activeAlgorithm = name;
        stopAnimation();

        tabs.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.algorithm === name);
        });

        quickOptions.classList.toggle('hidden', name !== 'quick');
        playerControls.classList.toggle('hidden', name === 'quick');
        stepProgress.classList.toggle('hidden', name === 'quick');
        statAlgorithm.textContent = algorithmLabels[name];
        setMessage(`Selected ${algorithmLabels[name]}. Enter values and click Sort.`, 'success');
        updatePlaybackControls();
    }

    function parseNumbers(value) {
        const tokens = value.replace(/\n/g, ' ').split(/[\s,]+/).map(token => token.trim()).filter(Boolean);

        if (tokens.length === 0) {
            throw new Error('Please enter at least one number.');
        }

        return tokens.map(token => {
            const parsed = Number(token);
            if (!Number.isFinite(parsed)) {
                throw new Error(`"${token}" is not a valid number.`);
            }
            return parsed;
        });
    }

    function addStep(steps, array, note, meta = {}) {
        steps.push({
            array: array.slice(),
            note,
            sortedIndices: meta.sortedIndices ? meta.sortedIndices.slice() : [],
            compared: meta.compared ? meta.compared.slice() : [],
            swapped: meta.swapped ? meta.swapped.slice() : [],
            pivot: meta.pivot ?? null,
            keyIndex: meta.keyIndex ?? null,
            pointers: meta.pointers ? { ...meta.pointers } : {},
            range: Array.isArray(meta.range) && meta.range.length === 2 ? meta.range.slice() : null,
            leftRange: Array.isArray(meta.leftRange) && meta.leftRange.length === 2 ? meta.leftRange.slice() : null,
            rightRange: Array.isArray(meta.rightRange) && meta.rightRange.length === 2 ? meta.rightRange.slice() : null
        });
    }

    function bubbleSortSteps(input) {
        const arr = input.slice();
        const steps = [];
        addStep(steps, arr, 'Initial array');

        for (let i = 0; i < arr.length - 1; i++) {
            let swapped = false;

            for (let j = 0; j < arr.length - i - 1; j++) {
                addStep(steps, arr, `Compare ${arr[j]} and ${arr[j + 1]}`, {
                    compared: [j, j + 1],
                    pointers: { i, j },
                    sortedIndices: Array.from({ length: i }, (_, index) => arr.length - 1 - index)
                });

                if (arr[j] > arr[j + 1]) {
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    swapped = true;
                    addStep(steps, arr, `Swap ${arr[j]} and ${arr[j + 1]}`, {
                        swapped: [j, j + 1],
                        pointers: { i, j },
                        sortedIndices: Array.from({ length: i }, (_, index) => arr.length - 1 - index)
                    });
                }
            }

            addStep(steps, arr, `End of pass ${i + 1}`, {
                pointers: { i, j: arr.length - i - 2 },
                sortedIndices: Array.from({ length: i + 1 }, (_, index) => arr.length - 1 - index)
            });

            if (!swapped) break;
        }

        addStep(steps, arr, 'Array is sorted', {
            sortedIndices: Array.from({ length: arr.length }, (_, index) => index)
        });

        return steps;
    }

    function selectionSortSteps(input) {
        const arr = input.slice();
        const steps = [];
        addStep(steps, arr, 'Initial array');

        for (let i = 0; i < arr.length - 1; i++) {
            let minIndex = i;
            const sortedPrefix = Array.from({ length: i }, (_, index) => index);

            addStep(steps, arr, `Pass ${i + 1}: search minimum for index ${i}`, {
                compared: [i],
                pointers: { i, j: i + 1 < arr.length ? i + 1 : i },
                sortedIndices: sortedPrefix
            });

            for (let j = i + 1; j < arr.length; j++) {
                addStep(steps, arr, `Scan j at index ${j}`, {
                    compared: [j, minIndex],
                    pointers: { i, j },
                    sortedIndices: sortedPrefix
                });

                if (arr[j] < arr[minIndex]) {
                    minIndex = j;
                    addStep(steps, arr, `New minimum found at index ${minIndex}`, {
                        compared: [j, i],
                        pointers: { i, j },
                        sortedIndices: sortedPrefix
                    });
                }
            }

            if (minIndex !== i) {
                [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
                addStep(steps, arr, `Swap into position ${i}`, {
                    swapped: [i, minIndex],
                    pointers: { i, j: minIndex },
                    sortedIndices: Array.from({ length: i + 1 }, (_, index) => index)
                });
            } else {
                addStep(steps, arr, `No swap needed in pass ${i + 1}`, {
                    pointers: { i, j: minIndex },
                    sortedIndices: Array.from({ length: i + 1 }, (_, index) => index)
                });
            }
        }

        addStep(steps, arr, 'Array is sorted', {
            sortedIndices: Array.from({ length: arr.length }, (_, index) => index)
        });

        return steps;
    }

    function insertionSortSteps(input) {
        const arr = input.slice();
        const steps = [];
        addStep(steps, arr, 'Initial array');

        for (let i = 1; i < arr.length; i++) {
            const key = arr[i];
            let j = i - 1;
            addStep(steps, arr, `Pick key ${key}`, {
                keyIndex: i,
                pointers: { i, j },
                sortedIndices: Array.from({ length: i }, (_, index) => index)
            });

            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                addStep(steps, arr, `Shift ${arr[j]} to the right`, {
                    compared: [j, j + 1],
                    pointers: { i, j },
                    keyIndex: j + 1,
                    sortedIndices: Array.from({ length: i }, (_, index) => index)
                });
                j--;
            }

            arr[j + 1] = key;
            addStep(steps, arr, `Insert ${key} in the correct place`, {
                pointers: { i, j: j + 1 },
                keyIndex: j + 1,
                sortedIndices: Array.from({ length: i + 1 }, (_, index) => index)
            });
        }

        addStep(steps, arr, 'Array is sorted', {
            sortedIndices: Array.from({ length: arr.length }, (_, index) => index)
        });

        return steps;
    }

    function quickSortSteps(input, pivotMode) {
        const arr = input.slice();
        const steps = [];
        addStep(steps, arr, 'Initial array');

        function choosePivot(low, high) {
            if (pivotMode === 'start') return low;
            if (pivotMode === 'middle') return Math.floor((low + high) / 2);
            if (pivotMode === 'last') return high;
            return low + Math.floor(Math.random() * (high - low + 1));
        }

        function pivotLabel() {
            if (pivotMode === 'start') return 'start';
            if (pivotMode === 'middle') return 'middle';
            if (pivotMode === 'last') return 'last';
            return 'random';
        }

        function partition(low, high) {
            let pivotIndex = choosePivot(low, high);
            const pivotValue = arr[pivotIndex];
            let left = low;
            let right = high;

            addStep(steps, arr, `Partition sub-array [${low}..${high}]`, {
                range: [low, high],
                pointers: { i: left, j: right },
                pivot: pivotIndex
            });

            addStep(steps, arr, `Choose ${pivotLabel()} pivot index ${pivotIndex} (value ${pivotValue})`, {
                pointers: { i: left, j: right },
                pivot: pivotIndex,
                range: [low, high]
            });

            while (true) {
                while (arr[left] < pivotValue) {
                    addStep(steps, arr, `Left pointer moves from index ${left} (${arr[left]})`, {
                        compared: [left, pivotIndex],
                        pointers: { i: left, j: right },
                        pivot: pivotIndex,
                        range: [low, high]
                    });
                    left++;
                }

                while (arr[right] > pivotValue) {
                    addStep(steps, arr, `Right pointer moves from index ${right} (${arr[right]})`, {
                        compared: [right, pivotIndex],
                        pointers: { i: left, j: right },
                        pivot: pivotIndex,
                        range: [low, high]
                    });
                    right--;
                }

                addStep(steps, arr, `Pointers stopped: left=${left} (${arr[left]}), right=${right} (${arr[right]})`, {
                    compared: [left, right],
                    pointers: { i: left, j: right },
                    pivot: pivotIndex,
                    range: [low, high]
                });

                if (left >= right) {
                    addStep(steps, arr, `Partitioned: left [${low}..${right}] | right [${right + 1}..${high}]`, {
                        pointers: { i: left, j: right },
                        pivot: pivotIndex,
                        range: [low, high],
                        leftRange: [low, right],
                        rightRange: [right + 1, high]
                    });
                    return right;
                }

                [arr[left], arr[right]] = [arr[right], arr[left]];
                if (pivotIndex === left) {
                    pivotIndex = right;
                } else if (pivotIndex === right) {
                    pivotIndex = left;
                }

                addStep(steps, arr, `Swap indexes ${left} and ${right}`, {
                    swapped: [left, right],
                    pointers: { i: left, j: right },
                    pivot: pivotIndex,
                    range: [low, high]
                });

                left++;
                right--;
            }
        }

        function quickSort(low, high) {
            if (low >= high) return;

            const splitIndex = partition(low, high);

            // Guard against non-shrinking ranges in edge cases (for example last-pivot as max value).
            if (splitIndex >= high) {
                quickSort(low, high - 1);
                return;
            }

            quickSort(low, splitIndex);
            quickSort(splitIndex + 1, high);
        }

        quickSort(0, arr.length - 1);

        addStep(steps, arr, 'Array is sorted', {
            sortedIndices: Array.from({ length: arr.length }, (_, index) => index)
        });

        return steps;
    }

    function renderArray(array, meta = {}) {
        const wrapper = document.createElement('div');
        wrapper.className = 'result-box';

        const hasActiveRange = Array.isArray(meta.range) && meta.range.length === 2;
        const rangeStart = hasActiveRange ? meta.range[0] : -1;
        const rangeEnd = hasActiveRange ? meta.range[1] : -1;
        const hasLeftRange = Array.isArray(meta.leftRange) && meta.leftRange.length === 2 && meta.leftRange[0] <= meta.leftRange[1];
        const hasRightRange = Array.isArray(meta.rightRange) && meta.rightRange.length === 2 && meta.rightRange[0] <= meta.rightRange[1];
        const pointers = meta.pointers && typeof meta.pointers === 'object' ? meta.pointers : {};

        array.forEach((value, index) => {
            const box = document.createElement('div');
            box.className = 'array-box';
            box.textContent = value;
            box.dataset.index = index;

            const pointerLabels = Object.keys(pointers).filter(label => {
                const pointerIndex = pointers[label];
                return Number.isInteger(pointerIndex) && pointerIndex === index;
            });

            if (pointerLabels.length) {
                const pointerWrap = document.createElement('div');
                pointerWrap.className = 'pointer-wrap';

                pointerLabels.forEach(label => {
                    const badge = document.createElement('span');
                    badge.className = `pointer-badge pointer-${label}`;
                    badge.textContent = label;
                    pointerWrap.appendChild(badge);
                });

                box.appendChild(pointerWrap);
            }

            if (hasLeftRange && index >= meta.leftRange[0] && index <= meta.leftRange[1]) {
                box.classList.add('box-left-range');
            }
            if (hasRightRange && index >= meta.rightRange[0] && index <= meta.rightRange[1]) {
                box.classList.add('box-right-range');
            }

            if (hasActiveRange && (index < rangeStart || index > rangeEnd)) {
                box.classList.add('box-outside-range');
            }

            if (meta.sortedIndices && meta.sortedIndices.includes(index)) box.classList.add('box-sorted');
            if (meta.compared && meta.compared.includes(index)) box.classList.add('box-compared');
            if (meta.swapped && meta.swapped.includes(index)) box.classList.add('box-swapped');
            if (meta.pivot === index) box.classList.add('box-pivot');
            if (meta.keyIndex === index) box.classList.add('box-key');

            wrapper.appendChild(box);
        });

        return wrapper;
    }

    function renderFinalResult(array) {
        resultBox.innerHTML = '';
        resultBox.appendChild(renderArray(array, { sortedIndices: array.map((_, index) => index) }));
    }

    function rangeText(range) {
        if (!Array.isArray(range) || range.length !== 2) return '[]';
        const [start, end] = range;
        return `[${start}..${end}]`;
    }

    function rangeValues(array, range) {
        if (!Array.isArray(range) || range.length !== 2) return '[]';
        const [start, end] = range;
        if (start > end) return '[]';
        return `[${array.slice(start, end + 1).join(', ')}]`;
    }

    function renderAllSteps(steps) {
        stepsContainer.innerHTML = '';

        steps.forEach((step, index) => {
            const card = document.createElement('div');
            card.className = 'step-card';

            const title = document.createElement('div');
            title.className = 'step-title';

            const heading = document.createElement('strong');
            heading.textContent = `Step ${index + 1}`;

            const note = document.createElement('span');
            note.className = 'step-note';
            note.textContent = step.note;

            title.appendChild(heading);
            title.appendChild(note);
            card.appendChild(title);
            card.appendChild(renderArray(step.array, step));

            if (step.leftRange || step.rightRange) {
                const info = document.createElement('div');
                info.className = 'subarray-info';


                if (step.leftRange) {
                    const left = document.createElement('span');
                    left.className = 'range-badge';
                    left.textContent = `Left ${rangeText(step.leftRange)}: ${rangeValues(step.array, step.leftRange)}`;
                    info.appendChild(left);
                }

                if (step.rightRange) {
                    const right = document.createElement('span');
                    right.className = 'range-badge';
                    right.textContent = `Right ${rangeText(step.rightRange)}: ${rangeValues(step.array, step.rightRange)}`;
                    info.appendChild(right);
                }

                card.appendChild(info);
            }

            stepsContainer.appendChild(card);
        });
    }

    function sort() {
        let numbers;

        try {
            numbers = parseNumbers(numbersInput.value);
        } catch (error) {
            stopAnimation();
            playbackSteps = [];
            setMessage(error.message, 'error');
            stepsContainer.innerHTML = '';
            resultBox.innerHTML = '';
            statSteps.textContent = '0';
            statTime.textContent = '0.00 ms';
            statLength.textContent = '0';
            updatePlaybackControls();
            return;
        }

        const start = performance.now();
        let steps = [];

        if (activeAlgorithm === 'bubble') {
            steps = bubbleSortSteps(numbers);
        } else if (activeAlgorithm === 'selection') {
            steps = selectionSortSteps(numbers);
        } else if (activeAlgorithm === 'insertion') {
            steps = insertionSortSteps(numbers);
        } else {
            steps = quickSortSteps(numbers, pivotStrategy.value);
        }

        const elapsed = performance.now() - start;
        const finalArray = steps.length ? steps[steps.length - 1].array : numbers.slice();

        stopAnimation();
        if (activeAlgorithm === 'quick') {
            playbackSteps = [];
            currentStepIndex = 0;
            renderAllSteps(steps);
        } else {
            playbackSteps = steps;
            currentStepIndex = 0;
            renderCurrentStep();
        }
        renderFinalResult(finalArray);

        statSteps.textContent = String(steps.length);
        statTime.textContent = `${elapsed.toFixed(2)} ms`;
        statLength.textContent = String(numbers.length);

        setMessage(`Sorted ${numbers.length} number(s) using ${algorithmLabels[activeAlgorithm]}.`, 'success');
        if (activeAlgorithm === 'quick') {
            stepProgress.textContent = `Total steps: ${steps.length}`;
            updatePlaybackControls();
        } else {
            startAnimation();
        }
    }

    function resetView() {
        stopAnimation();
        playbackSteps = [];
        currentStepIndex = 0;
        numbersInput.value = '5, 2, 9, 1, 3';
        stepsContainer.innerHTML = '';
        resultBox.innerHTML = '';
        statSteps.textContent = '0';
        statTime.textContent = '0.00 ms';
        statLength.textContent = '0';
        setMessage('Reset the input. Choose an algorithm and click Sort.', '');
        updatePlaybackControls();
    }

    function loadSample() {
        const samples = {
            bubble: '8, 3, 7, 4, 9, 2, 6',
            selection: '29, 10, 14, 37, 13',
            insertion: '12, 11, 13, 5, 6',
            quick: '10, 7, 8, 9, 1, 5'
        };

        numbersInput.value = samples[activeAlgorithm];
        setMessage(`Loaded a sample for ${algorithmLabels[activeAlgorithm]}.`, 'success');
    }

    tabs.addEventListener('click', (event) => {
        const button = event.target.closest('.tab-btn');
        if (!button) return;
        setActiveAlgorithm(button.dataset.algorithm);
    });

    sortBtn.addEventListener('click', sort);
    resetBtn.addEventListener('click', resetView);
    sampleBtn.addEventListener('click', loadSample);
    playBtn.addEventListener('click', startAnimation);
    pauseBtn.addEventListener('click', () => {
        stopAnimation();
        updatePlaybackControls();
    });
    prevBtn.addEventListener('click', () => {
        stopAnimation();
        setStep(currentStepIndex - 1);
    });
    nextBtn.addEventListener('click', () => {
        stopAnimation();
        setStep(currentStepIndex + 1);
    });
    restartBtn.addEventListener('click', () => {
        stopAnimation();
        setStep(0);
    });
    speedSelect.addEventListener('change', () => {
        if (animationTimer) {
            stopAnimation();
            startAnimation();
        }
    });

    setActiveAlgorithm('bubble');
    renderFinalResult([5, 2, 9, 1, 3]);
    updatePlaybackControls();