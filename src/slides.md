# numbl and mip: what MATLAB is missing

Jeremy Magland and Dan Fortunato

CCM Brown Bag Lunch Talk

17 March 2026

---

## Why MATLAB?

- Intuitive syntax purpose-built for numerical work
- Not bolted onto a general-purpose language; simpler and more direct
- Excellent built-in linear algebra
- Plotting and visualization just work

```matlab
% Solve Ax = b with a random SPD matrix
n = 500;
A = randn(n);
A = A' * A + n * eye(n);
b = randn(n, 1);
x = A \ b;
fprintf('residual: %e\n', norm(A*x - b));
```

---

## Why MATLAB (still)?

- Most of us use Python, Julia, or other languages, and for good reason
- But MATLAB is still widely used in applied math and engineering
- Important existing code is written in MATLAB (e.g., chebfun)

---

## What's holding it back

- **No package manager.**
  - Installing dependencies means copying folders and editing paths
- **Expensive licenses.**
  - Collaborators and reviewers may not have access
- **No in-browser option.**
  - MATLAB Online exists but runs on a server, not in the browser
- **MEX distribution is painful.**
  - Precompiled binaries for every platform

---

## What about open-source alternatives?

- **GNU Octave** and **Scilab** are free and open-source
- They solve the licensing problem, but not the others:
  - Heavy desktop applications with large installs, native dependencies
  - Cannot run client-side in the browser
  - No built-in package manager with dependency resolution (AFAIK)
  - Aging codebases

---

## Two new complementary tools

- **mip** - a package manager for MATLAB and MEX
- **numbl** - runs .m files in the browser and on the command line

Very lightweight, open-source, early stage

---

## mip: a package manager for MATLAB

Inspired by **brew** and **pip** — a pure-MATLAB client with a centralized registry.

- `mip install chebfun`
- `mip load chebfun`
- `mip list`
- `mip find-name-collisions`

Handles dependencies, precompiled MEX binaries, and path management.

- Packages are registered in a GitHub repo ([mip-core](https://github.com/mip-org/mip-core))
- A GitHub Actions workflow builds packages for all supported architectures as they change

---

## mip: what's in the registry

Currently published packages include:

- **chebfun** - numerical computing with functions
- **chunkie** - integral equations on curves
- **fmm2d** - fast multipole method in 2D
- **FLAM** - fast linear algebra in MATLAB
- **finufft** - nonuniform FFTs in 1D, 2D, and 3D (WIP)
- **surfacefun** - computing on surfaces
- and others (export\_fig, kdtree, ...)

---

## numbl: open-source numerical computing

Runs `.m` files, aiming for MATLAB compatibility.

- Can run in **browser**. All computation happens locally, no server needed
- Runs on the **command line**
- Optional native addon for LAPACK/FFTW performance
- Supports matrices, structs, cell arrays, function handles, classes, complex numbers, plotting, ...
- Goal: full MATLAB core syntax and functionality

```numbl-repl
```

---

## numbl: how it works

`.m` source code passes through a compilation pipeline:

Lexer → Parser → Lowering/IR → Codegen → JavaScript Engine

- **Upfront compilation** including type inference where possible
- **JIT compilation** when types are not known at compile time
- Extensive built-in function library
- Can call WebAssembly and native libraries from `.m` code

---

## numbl: what the generated code looks like

Scalars → JS numbers. Matrices → `Float64Array` with shape. Structs → `Map`.

When types are known, numbl emits direct JS:

```
y = x * 2          →  y = (x * 2)
```

When types are unknown, runtime dispatch:

```
y = a + b           →  y = $rt.binop("+", a, b)
A(1:end, 2)         →  $rt.index(A, [$rt.range(1, 1, $rt.END), 2])
```

Functions are specialized per argument type: `f(3)` and `f([1,2,3])` compile to different JS functions.

---

## numbl: type inference

MATLAB is dynamically typed. Without type info, every operation goes through runtime dispatch.

Type inference figures out types at compile time:

- Track assignments: `x = 5` → `x` is a scalar
- Propagate: `y = x + 1` → `y` is a scalar
- Specialize calls: `f` called with a matrix → compile a matrix-specific version
- Builtin return types: `size(A)` → row vector, `length(A)` → scalar

Inference succeeds → fast JS. Otherwise → runtime dispatch (correct but slower).

---

## numbl: function dispatch

In MATLAB, `f(x)` can mean different things depending on what `x` is:

- `plot(matrix)` → plot columns as series
- `plot(chebfun)` → chebfun's overloaded `plot`
- `A(1)` -- function call or array indexing? Depends on what `A` is

When types are known, numbl resolves the correct function upfront. Otherwise, it dispatches at runtime, checking for class method overloads first.

---

## How they fit together

- **mip** works in both MATLAB and numbl; same packages, same workflow
- **numbl** uses mip under the hood to install and load packages

---

## Demo - running fully in the browser

This runs entirely in your browser.

```numbl-embed
% Solve Ax = b with a random SPD matrix
n = 500;
A = randn(n);
A = A' * A + n * eye(n);
b = randn(n, 1);
x = A \ b;
fprintf('residual: %e\n', norm(A*x - b));
```

---

## Demo - chebfun in the browser

chebfun: ~2,300 .m files, ~160,000 lines of code (excluding tests); running unmodified in the browser.

```numbl-embed
mip load chebfun;

f = chebfun(@(x) cos(10*x) .* exp(-x.^2));
disp(f)

% Derivative
df = diff(f);

% Roots
r = roots(f);
fprintf('Number of roots: %d\n', length(r));
disp(r)

% Integration
I = sum(f);
fprintf('Integral over [-1, 1]: %.15f\n', I);
```

---

## Demo - plotting

```numbl-embed
subplot(1, 3, 1);
x = linspace(-2*pi, 2*pi, 200);
plot(x, sin(x), 'b-', x, cos(x), 'r--');
title('Trig functions');
legend('sin', 'cos');

subplot(1, 3, 2);
t = linspace(0, 8*pi, 500);
plot3(cos(t), sin(t), t);
title('Helix');

subplot(1, 3, 3);
surf(peaks(50));
shading interp; colormap(hot);
title('Surface');
```

---

## Demo - FINUFFT (via WebAssembly)

A compiled C++ library running in the browser via WebAssembly.

```numbl-embed
mip load finufft;

% 1D type 1: nonuniform points -> Fourier modes
M = 100000;
x = pi * (2 * rand(M, 1) - 1);
c = randn(M, 1) + 1i * randn(M, 1);

N = 200;
tic;
f = finufft1d1(x, c, 1, 1e-9, N);
elapsed = toc;

fprintf('M = %d nonuniform points\n', M);
fprintf('N = %d Fourier modes\n', N);
fprintf('Elapsed: %.3f s\n', elapsed);
fprintf('First few modes:\n');
disp(f(1:5));
```

---

## numbl on the command line

No installation beyond Node.js. Just use `npx`:

```matlab
npx numbl eval "disp(eig(randn(5)))"

npx numbl run myscript.m

npx numbl mip install chebfun

npx numbl                          % interactive REPL
```

---

## Revisiting the problems

- **No package manager** → `mip install chebfun`
- **Expensive licenses** → numbl is open-source, free to use, no license required
- **No in-browser option** → numbl runs entirely client-side in the browser
- **MEX distribution is painful** → mip provides precompiled binaries per platform

---

## Future work - mip

- Develop the automated build system across all supported architectures
- Add many more packages to the registry
- Set up a process for accepting community contributions of new packages

---

## Future work - numbl

- More functionality needed to fully run complex packages like chebfun, surfacefun
- **Performance
  - Competitive for linear algebra (LAPACK/OpenBLAS)
  - Code with complex data structures and runtime-resolved features: ~10x slower today
  - JavaScript engines are fast but still slower than native code for tight loops
  - Improving this with type inference and JIT optimization

---

## Thank you

We welcome feedback and contributions! Reach out to Dan or Jeremy.

- Try it now: `npx numbl`
- [numbl.org](https://numbl.org)
- [mip.sh](https://mip.sh) (coming soon)
- [github.com/mip-org/mip-core](https://github.com/mip-org/mip-core)

Initial inspiration for numbl from [runmat](https://github.com/runmat-org/runmat).
