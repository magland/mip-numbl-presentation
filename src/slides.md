# numbl and mip: what MATLAB is missing

Jeremy Magland and Dan Fortunato

CCM Brown Bag Lunch

---

## Why MATLAB?

- Interactive, intuitive syntax for numerical work
- Excellent built-in linear algebra
- Large existing codebase in applied math and engineering
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

## MATLAB's place in the world

- Most of us use Python, Julia, or other languages, and for good reason
- But MATLAB is still widely used in applied math and engineering
- Important existing code is written in MATLAB (e.g., chebfun)
- Not bolted onto a general-purpose language
- Simpler and more direct for numerical work

So what's missing?

---

## The problem

- **No package manager.**
  - Installing dependencies means copying folders and editing paths
- **Expensive licenses.**
  - Collaborators and reviewers may not have access
- **Tied to the cloud or desktop.**
  - MATLAB Online exists but runs on a server, not in the browser
- **MEX distribution is painful.**
  - Precompiled binaries for every platform

---

## Two new tools (early stage, work in progress)

- **mip** - a package manager for MATLAB and MEX
- **numbl** - an open-source MATLAB that runs in the browser and on the command line

Complementary and tightly integrated.

---

## mip: a package manager for MATLAB

Pure-MATLAB client, centralized package registry.

- `mip install chebfun`
- `mip load chebfun`
- `mip list`
- `mip find-name-collisions`

Handles dependencies, precompiled MEX binaries, and path management.

---

## mip: what's in the registry

Currently published packages include:

- **chebfun** - numerical computing with functions
- **chunkie** - integral equations on curves
- **fmm2d** - fast multipole method in 2D
- **FLAM** - fast linear algebra in MATLAB
- **surfacefun** - computing on surfaces
- and others (export\_fig, kdtree, ...)

---

## numbl: open-source numerical computing

An open-source computing environment that runs `.m` files, aiming for MATLAB compatibility.

- Can run in **browser**. All computation happens locally, no server needed
- Runs on the **command line**
- Optional native addon for LAPACK/FFTW performance
- Supports matrices, structs, cell arrays, function handles, classes, complex numbers, plotting, ...
- Goal: full MATLAB core syntax and functionality

---

## numbl: how it works

`.m` source code passes through a compilation pipeline:

Lexer → Parser → Lowering/IR → Codegen → JavaScript

- **Upfront compilation** including type inference where possible
- **JIT compilation** when types are not known at compile time
- Extensive built-in function library
- Can call WebAssembly and native libraries from `.m` code

---

## Why both?

- **mip** - package distribution and dependency management
- **numbl** - run `.m` code without a license, in the browser or on the command line
- numbl uses mip to manage its packages
- mip also works directly in MATLAB.

---

## Demo - running fully in the browser

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

## Future work - mip

- Develop the automated build system across all supported architectures
- Add many more packages to the registry
- Set up a process for accepting community contributions of new packages

---

## Future work - numbl

- More functionality needed to fully run complex packages like chebfun, surfacefun
- **Speed is the main limitation**
  - Simple linear algebra (LAPACK/OpenBLAS): comparable to MATLAB
  - Complex data structures and interpreted code: ~10x slower
- MATLAB has highly optimized JIT for untyped code. numbl has JIT but needs full type inference to close the gap
- JavaScript engines are fast but still slower than native code for tight loops
- Focus going forward: type inference, JIT optimization, and broader language coverage

---

## Thank you

Jeremy Magland and Dan Fortunato

We welcome feedback and contributions!

- [numbl.org](https://numbl.org)
- [github.com/mip-org/mip-core](https://github.com/mip-org/mip-core)

Initial inspiration for numbl from [runmat](https://github.com/runmat-org/runmat).
