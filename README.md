# FSND

FSND is the project folder for Udacity Full Stack Nanodegree Program.

Here is the list for all those project:

*1. Moive trailer web*

*2. Portfolio site*

*3. Logs Analysis*

*4. Item Catalog*

## Installation

Clone the GitHub repository

```{bash}
$ git clone https://github.com/KieranHu/FSND.git
$ cd FSND
```

## Project 1 *Moive trailer web*

### How to run the code in project one *Moive trailer web*

In the FSND folder, open terminal
```{bash}
cd P1_moive_trailer_web
python entertainment_center.py
```

## Project 2 *Portfolio site*

### How to view the project two

In the FSND folder, open the index.html file in folder P2_Portfolio_site

## Project 3 *Logs Analysis*

### How to run the code in project three  *Logs Analysis*

The database is available from *Udacity* Virtual Machine, so *Vagrant* and *VirtualBox* are required. What's more, *Python3* and *psycopg2* module are also required.

Copy the *Project3.py* and *newdata.sql* file into the vagrant folder, which is link to the virtual Machine, in your own computer.
To load the data, Use
```{bash}
psql -d news -f newsdata.sql
```
Use
```{bash}
Python3 Project3.py
```
to run the code.

File *result.txt* is the program's output. You should see the same result from the running result of the code.

## Project 4 *Item Catalog*

### Run the code

```{bash}
python3 main.py
```
Then goto http://localhost:5000 to see the result.
