"""
Comprehensive Exploratory Data Analysis (EDA) generator for LearnTrack ML.
Computes summary statistics, distributions, correlations, and generates eda.ipynb.
"""

import os
import json
import pandas as pd
import numpy as np

def run_eda():
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "processed", "academic_performance.csv")
    df = pd.read_csv(data_path)

    print("=== 1. DATASET SHAPE & TYPES ===")
    print(f"Total Rows: {df.shape[0]}, Total Features: {df.shape[1]}")
    print(df.dtypes)

    print("\n=== 2. MISSING VALUES & DUPLICATES ===")
    missing = df.isnull().sum()
    print("Missing values per column:")
    print(missing)
    print(f"Duplicate rows: {df.duplicated().sum()}")

    print("\n=== 3. NUMERICAL DESCRIPTIVE STATISTICS ===")
    desc = df.describe().round(2)
    print(desc)

    print("\n=== 4. CORRELATION WITH TARGET (final_score) ===")
    corr = df.corr()
    target_corr = corr["final_score"].sort_values(ascending=False).round(3)
    print(target_corr)

    print("\n=== 5. GRADE DISTRIBUTION (Configurable Standard) ===")
    def map_grade(score):
        if score >= 90:
            return "A+"
        if score >= 80:
            return "A"
        if score >= 70:
            return "B+"
        if score >= 60:
            return "B"
        if score >= 50:
            return "C"
        if score >= 40:
            return "D"
        return "F"

    grades = df["final_score"].apply(map_grade).value_counts()
    print(grades)

    # Generate a Jupyter Notebook (.ipynb)
    notebook_content = {
        "cells": [
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "# LearnTrack ML: Exploratory Data Analysis (EDA)\n",
                    "## Academic Performance Prediction Dataset\n",
                    "This notebook documents statistical distributions, feature correlations, and target characteristics for the LearnTrack regression pipeline."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": 1,
                "metadata": {},
                "outputs": [],
                "source": [
                    "import pandas as pd\n",
                    "import numpy as np\n",
                    "\n",
                    "df = pd.read_csv('../data/processed/academic_performance.csv')\n",
                    "print(f'Dataset Loaded: {df.shape[0]} rows, {df.shape[1]} features')\n",
                    "df.head()"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "### 1. Data Integrity & Missing Value Verification\n",
                    "Verifying zero null entries across all 6 predictive features and target variable."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": 2,
                "metadata": {},
                "outputs": [],
                "source": [
                    "print('Missing Values:\\n', df.isnull().sum())\n",
                    "print('Duplicate Rows:', df.duplicated().sum())"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "### 2. Descriptive Summary Statistics\n",
                    "Examines central tendency, dispersion, and quartiles across features."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": 3,
                "metadata": {},
                "outputs": [],
                "source": [
                    "df.describe().round(2)"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "### 3. Correlation Matrix Analysis\n",
                    "Evaluates linear Pearson correlation coefficients between academic features and final score."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": 4,
                "metadata": {},
                "outputs": [],
                "source": [
                    "corr_matrix = df.corr().round(3)\n",
                    "print('Correlation with final_score:\\n', corr_matrix['final_score'].sort_values(ascending=False))\n",
                    "corr_matrix"
                ]
            },
            {
                "cell_type": "markdown",
                "metadata": {},
                "source": [
                    "### 4. Grade Distribution\n",
                    "Categorical spread based on standard university thresholds (A+ to F)."
                ]
            },
            {
                "cell_type": "code",
                "execution_count": 5,
                "metadata": {},
                "outputs": [],
                "source": [
                    "def assign_grade(score):\n",
                    "    if score >= 90:\n",
                    "        return 'A+'\n",
                    "    if score >= 80:\n",
                    "        return 'A'\n",
                    "    if score >= 70:\n",
                    "        return 'B+'\n",
                    "    if score >= 60:\n",
                    "        return 'B'\n",
                    "    if score >= 50:\n",
                    "        return 'C'\n",
                    "    if score >= 40:\n",
                    "        return 'D'\n",
                    "    return 'F'\n",
                    "\n",
                    "df['grade'] = df['final_score'].apply(assign_grade)\n",
                    "print(df['grade'].value_counts())"
                ]
            }
        ],
        "metadata": {
            "language_info": {
                "name": "python",
                "version": "3.13"
            }
        },
        "nbformat": 4,
        "nbformat_minor": 4
    }

    nb_path = os.path.join(os.path.dirname(__file__), "eda.ipynb")
    with open(nb_path, "w", encoding="utf-8") as f:
        json.dump(notebook_content, f, indent=2)

    print(f"\nJupyter notebook generated at {nb_path}")

if __name__ == "__main__":
    run_eda()
